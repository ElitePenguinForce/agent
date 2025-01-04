import { ApplicationCommandOptionType } from "discord.js";
import Guild from "../../../core/db/models/guild.js";
import Member from "../../../core/db/models/member.js";
import createCommand from "../../../shared/factories/commands/index.js";
import handleServerAutocomplete from "../../../shared/helpers/handleServerAutocomplete.js";
import isGuard from "../../../shared/helpers/isGuard.js";

export default createCommand({
  data: {
    name: "representative",
    description: "Define manualmente o representante de um servidor",
    dmPermission: false,
    defaultMemberPermissions: ["ViewChannel"],
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "server",
        description: "O servidor para definir um representante",
        required: true,
        autocomplete: handleServerAutocomplete,
      },
      {
        type: ApplicationCommandOptionType.User,
        name: "representative",
        description: "O usuário que será o representante do servidor",
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const member = interaction.options.getMember("representative");
    if (!member) {
      return interaction.reply({
        content: "Membro não encontrado",
        ephemeral: true,
      });
    }

    const guildId = interaction.options.getString("server");
    const guildDoc = await Guild.findById(guildId);
    if (!guildDoc) {
      return interaction.reply({
        content: "Servidor não encontrado no banco de dados",
        ephemeral: true,
      });
    }

    if (guildDoc.pending) {
      return interaction.reply({
        content: "O servidor ainda não foi aprovado na EPF",
        ephemeral: true,
      });
    }

    if (
      guildDoc.representative !== interaction.user.id &&
      !isGuard(interaction.member)
    ) {
      return interaction.reply({
        content:
          "Apenas o representante desse servidor pode definir um novo representante",
        ephemeral: true,
      });
    }
    const memberExists = await Member.exists({
      user: member.id,
      guild: guildId,
    });
    if (!memberExists) {
      return interaction.reply({
        content: "Esse membro não faz parte da staff desse servidor",
        ephemeral: true,
      });
    }
    guildDoc.representative = member.id;
    await guildDoc.save();
    return interaction.reply(
      `${member} definido como representante de [\`${guildDoc.name}\`](https://discord.gg/${guildDoc.invite})`,
    );
  },
  // async autocomplete$server(interaction, value) {
  //   const guildModel = require("../models/guild.js");
  //   const name = {
  //     $regex: new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
  //   };
  //   const representing = interaction.member.roles.cache.has(config.guard)
  //     ? await guildModel.find({ name }).sort({ name: 1 }).limit(25)
  //     : await guildModel.find({
  //       representative: interaction.user.id,
  //       name,
  //     }).sort({ name: 1 }).limit(25);
  //   return representing.map((guildDoc) => ({
  //     name: guildDoc.name,
  //     value: guildDoc._id,
  //   }));
  // }
});
