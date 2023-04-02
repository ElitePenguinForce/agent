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
      replied?.author.id === client.user.id
    ) {
      const msg = await message.reply({
        content:
          "<:eita:842786888174665739> Carregando meus neurônios de pinguim...",
      });

      const youChatPromise = new Promise((resolve, reject) => {
        youchatwrapper.cloudflare_message_bypass = true;
        youchatwrapper.cloudflare_retry_limit = 5;
        youchatwrapper.apiKey = process.env.YOUCHAT_APIKEY;
        youchatwrapper.retry = true;
        youchatwrapper.retry_limit = 3;

        youchatwrapper.chat(
          "responde em português! " +
            message.content.replace(`<@${client.user.id}>`, ""),
          function (callback) {
            if (callback) {
              resolve(callback);
            } else {
              reject(new Error("Empty response from YouChat"));
            }
          }
        );
      });

      try {
        await msg.edit({
          content: youChatPromise
            .replace("you.com", "Elite Penguim Force")
            .replace("You.com", "Elite Penguim Force"),
        });
      } catch (error) {
        console.error("Error while chatting with YouChat:", error);
      }
    }
  },
};
