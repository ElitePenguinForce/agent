import config from "../../../core/config/index.js";
import createEvent from "../../../shared/factories/event.js";

export default createEvent({
  name: "threadCreate",
  execute: async (thread, newlyCreated) => {
    if (!newlyCreated) {
      return;
    }

    if (thread.parentId === config.ids.channels.suggestions) {
      await thread.setAppliedTags([config.ids.tags.pending]);
    }
  },
});
