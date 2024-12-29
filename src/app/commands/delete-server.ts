import { ApplicationCommandOptionType } from "discord.js";
import config from "../../core/config/index.js";
import Guild from "../../core/db/models/guild.js";
import Member, {
  type GuildPopulatedMemberSchemaType,
} from "../../core/db/models/member.js";
import createConfirmationButtons from "../../shared/factories/buttons/createConfirmationButtons.js";
import createCommand from "../../shared/factories/commands/index.js";
import handleServerAutocomplete from "../../shared/helpers/handleServerAutocomplete.js";
import isGuard from "../../shared/helpers/isGuard.js";

export default createCommand({
  data: {
    name: "deleteserver",
    description: "Delete um servidor do banco de dados",
    dmPermission: false,
    defaultMemberPermissions: ["Administrator"],
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "server",
        description: "Selecione o servidor que será deletado",
        required: true,
        autocomplete: handleServerAutocomplete,
      },
    ],
  },
  async execute(interaction) {
    if (!isGuard(interaction.member)) {
      return interaction.reply({
        content: "Você não tem permissão para executar esse comando",
        ephemeral: true,
      });
    }

    const guildId = interaction.options.getString("server", true);
    const guildDoc = await Guild.findById(guildId);
    if (!guildDoc) {
      return interaction.reply({
        content: "Servidor não encontrado",
        ephemeral: true,
      });
    }

    const membersCount = await Member.countDocuments({ guild: guildId });
    const row = createConfirmationButtons();

    const reply = await interaction.reply({
      content:
        `Tem certeza de que deseja deletar o servidor **${guildDoc.name}** do bando de dados?` +
        `${
          membersCount === 0
            ? ""
            : `\n${membersCount} membros ainda são staffs desse servidor.`
        }`,
      components: [row],
      ephemeral: true,
    });
    const collector = reply.createMessageComponentCollector({
      filter: (interaction) => interaction.user.id === interaction.user.id,
      time: 60000,
      max: 1,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "collector:cancel") {
        return await interaction.update({
          content: "Operação cancelada",
          components: [],
        });
      }

      await interaction.update({
        content: "Deletando servidor...",
        components: [],
      });

      if (guildDoc.role) {
        await interaction.guild.roles
          .delete(guildDoc.role)
          .catch(async (err) => {
            console.error(err);
            await interaction.followUp({
              content: "Não foi possível deletar o cargo do servidor",
              ephemeral: true,
            });
          });
      }
      const memberDocs = await Member.find({ guild: guildId });
      for (const memberDoc of memberDocs) {
        const member = await interaction.guild.members
          .fetch(memberDoc.user)
          .catch(() => null);
        if (!member) {
          continue;
        }

        if (guildDoc.owner === member.id) {
          const ownedGuildExists = await Guild.exists({
            _id: {
              $ne: guildId,
            },
            owner: member.id,
            pending: {
              $ne: true,
            },
          });
          if (!ownedGuildExists) {
            await member.roles.remove(config.ids.roles.owner);
          }
        } else if (memberDoc.admin) {
          const adminStaffs = await Member.find<GuildPopulatedMemberSchemaType>(
            {
              guild: {
                $ne: guildId,
              },
              user: member.id,
              admin: true,
            },
          ).populate("guild");

          const isStillAdmin = adminStaffs.some(
            (doc) => doc.guild.pending !== true,
          );

          if (!isStillAdmin) {
            await member.roles.remove(config.ids.roles.admin);
          }
        } else {
          const modStaffs = await Member.find<GuildPopulatedMemberSchemaType>({
            user: member.id,
            admin: {
              $ne: true,
            },
            guild: {
              $ne: guildId,
            },
          }).populate("guild");

          const isStillMod = modStaffs.some(
            (doc) => doc.guild.pending !== true,
          );

          if (!isStillMod) {
            await member.roles.remove(config.ids.roles.mod);
          }
        }
      }

      await guildDoc.deleteOne();
      await Member.deleteMany({ guild: guildId });
      await interaction.editReply({ content: "Servidor deletado" });
      interaction.client.updateServersData(
        [
          `<:icon_guild:1037801942149242926> **|** O servidor **${guildDoc.name}** saiu da EPF`,
        ],
        false,
      );
    });
    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        await interaction.editReply({
          content: "Operação cancelada",
          components: [],
        });
      }
    });
  },
});
