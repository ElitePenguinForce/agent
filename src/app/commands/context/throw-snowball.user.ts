import createColorlessEmbed from "../../../shared/factories/embeds/colorless.js";
import createUserContext from "../../../shared/factories/user-context.js";

export default createUserContext({
  data: {
    name: "Throw a snowball",
    nameLocalizations: {
      "pt-BR": "Atire uma bola de neve"
    },
    dmPermission: true,
  },
  async execute(interaction) {
    const target = interaction.targetUser;

    return interaction.reply({
      content: `<@${target.id}>`,
      embeds: [
        createColorlessEmbed({
          description: `**${interaction.user}** jogou uma bola de neve em **${target}**`,	
          image: {
            url: "https://i.imgur.com/cPibpID.gif",
          }
        })
      ],
      allowedMentions: {
        users: [target.id]
      }
    })
  },
})