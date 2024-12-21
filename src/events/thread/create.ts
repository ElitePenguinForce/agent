import config from "../../config.js";
import createEvent from "../../factories/event.js";

export default createEvent({
  name: "threadCreate",
  execute: async (thread, newlyCreated) => {
    if (!newlyCreated) {
      return;
    }

    // fuck it, I don't trust this type
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (thread.partial) {
      await thread.fetch();
    }

    if (thread.parentId === config.ids.channels.suggestions) {
      await thread.setAppliedTags([config.ids.tags.pending]);
    }
  },
});
