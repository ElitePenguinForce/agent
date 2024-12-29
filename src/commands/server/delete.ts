import {
  ActionRow,
  Button,
  ButtonInteraction,
  Command,
  CommandContext,
  createStringOption,
  Declare,
  Middlewares,
  Options,
} from "seyfert";
import { ButtonStyle, MessageFlags } from "seyfert/lib/types";
import config from "../../config";
import guildModel, { GuildSchemaType } from "../../database/models/guild.model";
import memberModel, {
  GuildPopulatedMemberSchemaType,
} from "../../database/models/member.model";
import serverAutocomplete from "../../shared/autocompletes/server";
import CommandRuntimeError from "../../shared/errors/CommandRuntimeError";

const options = {
  server: createStringOption({
    description: "The server to delete",
    required: true,
    autocomplete: serverAutocomplete,
  }),
};

@Declare({
  name: "deleteserver",
  description: "Delete a server from the system",
  contexts: ["Guild"],
})
@Options(options)
@Middlewares(["guardOnly"])
export default class DeleteServerCommand extends Command {
  async run(context: CommandContext<typeof options>) {
    const guildId = context.options.server;
    const guildDoc = await guildModel.findById(guildId);

    if (!guildDoc) {
      throw new CommandRuntimeError("Servidor não encontrado no sistema");
    }

    const membersCount = await memberModel.countDocuments({ guild: guildId });

    const confirmId = `${context.interaction.id}_confirm`;
    const cancelId = `${context.interaction.id}_cancel`;

    const row = new ActionRow()
      .setComponents([
        new Button()
          .setCustomId(cancelId)
          .setLabel("Cancelar")
          .setStyle(ButtonStyle.Secondary),
        new Button()
          .setCustomId(confirmId)
          .setLabel("Confirmar")
          .setStyle(ButtonStyle.Danger),
      ]);

    const reply = await context.write({
      content:
        `Tem certeza de que deseja deletar o servidor **${guildDoc.name}** do bando de dados?` +
        `${
          membersCount === 0
            ? ""
            : `\n${membersCount} membros ainda são staffs desse servidor.`
        }`,
      components: [row],
      flags: MessageFlags.Ephemeral,
    }, true);

    const collector = reply.createComponentCollector({
      filter: (interaction) => interaction.user.id === context.author.id,
      timeout: 60000,
      onStop: (reason) => {
        context.client.logger.debug(reason);
        if (reason === "timeout" || reason === "cancel") {
          reply.edit({
            content: "Operação cancelada",
            components: [],
          });
        }
      },
    });

    collector.run([confirmId, cancelId], (interaction) => {
      if (!interaction.isButton()) return;

      if (interaction.customId === cancelId) {
        collector.stop("cancel");
        return;
      }

      this.handleConfirmDelete(context, interaction, guildDoc);
    });
  }

  async handleConfirmDelete(
    context: CommandContext,
    interaction: ButtonInteraction,
    guildDoc: GuildSchemaType,
  ) {
    await interaction.write({
      content: "Deletando servidor...",
      flags: MessageFlags.Ephemeral,
    });

    const guild = context.guild()!;

    if (guildDoc.role) {
      await guild.roles
        .delete(guildDoc.role)
        .catch(async (err) => {
          console.log(err);
          await interaction.editOrReply({
            content: "Não foi possível deletar o cargo do servidor",
          });
        });
    }

    const memberDocs = await memberModel.find({ guild: guild.id });
    for (const memberDoc of memberDocs) {
      const member = await guild.members.fetch(memberDoc.user)
        .catch(() => null);
      if (!member) continue;
      if (guildDoc.owner === member.id) {
        const ownedGuildExists = await guildModel.exists({
          owner: member.id,
          pending: {
            $ne: true,
          },
        });
        if (!ownedGuildExists) {
          await member.roles.remove(config.ids.roles.owner);
        }
      } else if (memberDoc.admin) {
        const adminStaffs = await memberModel.find<
          GuildPopulatedMemberSchemaType
        >({
          user: member.id,
          admin: true,
        }).populate("guild");
        const isStillAdmin = adminStaffs.some((doc) =>
          doc.guild.pending !== true
        );
        if (!isStillAdmin) await member.roles.remove(config.ids.roles.admin);
      } else {
        const modStaffs = await memberModel.find<
          GuildPopulatedMemberSchemaType
        >({
          user: member.id,
          admin: {
            $ne: true,
          },
        }).populate("guild");
        const isStillMod = modStaffs.some((doc) => doc.guild.pending !== true);
        if (!isStillMod) await member.roles.remove(config.ids.roles.mod);
      }
    }

    await guildModel.deleteOne({ _id: guildDoc._id });
    await memberModel.deleteMany({ guild: guild.id });
    await interaction.editOrReply({ content: "Servidor deletado" });
    // client.emit(
    //   "updateGuilds",
    //   false,
    //   `<:icon_guild:1037801942149242926> **|** O servidor **${guildDoc.name}** saiu da EPF`,
    // );
  }
}
