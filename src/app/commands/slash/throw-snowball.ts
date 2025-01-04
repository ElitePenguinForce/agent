import { ApplicationCommandOptionType } from "discord.js";
import createCommand from "../../../shared/factories/commands/index.js";
import createColorlessEmbed from "../../../shared/factories/embeds/colorless.js";

export default createCommand({
  data: {
    name: "throw-snowball",
    description: "Throw a snowball at someone",
    descriptionLocalizations: {
      "pt-BR": "Jogue uma bola de neve em alguém",
    },
    dmPermission: false,
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: "user",
        description: "The user to throw the snowball at",
        descriptionLocalizations: {
          "pt-BR": "O usuário para quem você quer jogar a bola de neve",
        },
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const target = interaction.options.getUser("user", true);

    return interaction.reply({
      content: `<@${target.id}>`,
      embeds: [
        createColorlessEmbed({
          description: `**${interaction.user}** jogou uma bola de neve em **${target}**`,
          image: {
            url: "https://i.imgur.com/cPibpID.gif",
          },
        }),
      ],
      allowedMentions: {
        users: [target.id],
      },
    });
  },
});
