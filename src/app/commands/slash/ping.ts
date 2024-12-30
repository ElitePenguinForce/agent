import createCommand from "../../../shared/factories/commands/index.js";

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
