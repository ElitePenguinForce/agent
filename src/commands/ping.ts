import createCommand from "../factories/command.js";

export default createCommand({
  data: {
    name: "ping",
    description: "Verifica o latência atual do bot",
    dmPermission: false,
  },
  execute(interaction) {
    return interaction.reply("Pong!");
  },
});
