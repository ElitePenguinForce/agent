const { model, Schema } = require('mongoose');
const config = require('../config');

const constantsSchema = new Schema({
    _id: {
        type: String,
        match: /^\d{17,19}$/
    },
    lastGuildsChannelUpdate: {
        type: Date,
        default: new Date()
    },
    updatingGuildsChannel: {
        type: Boolean,
        default: false
    },
    scheduledUpdate: {
        type: Boolean,
    },
    updateLogs: {
        type: [String],
        default: () => [],
    },
});

constantsSchema.statics.getConstants = async function() {
    return await this.findById(config.agent) || await this.create({ _id: config.agent })
}

constantsSchema.statics.updateConstants = async function (data) {
    return await this.updateOne({ _id: config.agent }, data, {
        new: true,
        upsert: true,
        setDefaultOnInsert: true,
    });
};

module.exports = model('constants', constantsSchema);