const youchatwrapper = require("@codernocook/youchatwrapper");

module.exports = {
  name: "messageCreate",
  execute: async (message, client) => {
    const replied =
      message.reference !== null
        ? await message.channel.messages.fetch(message.reference.messageId)
        : null;

    if (
      message.content.includes(`<@${client.user.id}>`) ||
      (replied !== null ? replied.author.id === client.user.id : 0)
    ) {
      message
        .reply({
          content:
            "<:eita:842786888174665739> Carregando meus neurônios de pinguim...",
        })
        .then((msg) => {
          youchatwrapper.cloudflare_message_bypass = true;
          youchatwrapper.cloudflare_retry_limit = 5;
          youchatwrapper.apiKey = "FPWETB472RRB9L67U32US47RBW1D5Y0GH8M";
          youchatwrapper.retry = true;
          youchatwrapper.retry_limit = 3;

          youchatwrapper.chat(
            "responde em português! " +
              message.content.replace(`<@${client.user.id}>`, ""),
            function (callback) {
              msg.edit({
                content: callback
                  .replace("@everyone", "everone")
                  .replace("@here", "her")
                  .replace("you.com", "Elite Penguim Force")
                  .replace("You.com", "Elite Penguim Force"),
              });
            }
          );
        });
    }
  },
};
