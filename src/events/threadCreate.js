const config = require("../config");

module.exports = {
    name: 'threadCreate',
    execute: async (thread, newlyCreated) => {
        if(!newlyCreated) return;
        if(thread.partial) await thread.fetch();
        if(thread.parentId === config.suggestionsChannel) await thread.setAppliedTags([config.pendingTag]);
    },
};