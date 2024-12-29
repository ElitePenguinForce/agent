import { createEvent } from "seyfert";

export default createEvent({
  data: {
    name: "ready",
    once: true,
  },
  async run(user, client) {
    client.logger.info(`Logged in as ${user.tag}`);
  },
});
