const {Schema, model} = require('mongoose');

const guildSchema = new Schema({
    _id: {
        type: String,
        match: /^\d{17,19}$/,
    },
    role: {
        type: String,
        match: /^\d{17,19}$/,
    },
    representative: {
        type: String,
        match: /^\d{17,19}$/,
        required: true,
        index: true,
    },
    invite: {
        type: String,
        match: /^\w+$/,
        required: true,
    },
    name: {
        type: String,
        minLength: 2,
        maxLength: 100,
        required: true,
        index: true,
    },
    owner: {
        type: String,
        match: /^\d{17,19}$/,
        index: true,
    },
    pending: Boolean,
});

guildSchema.pre('findOneAndDelete', async () => {
    const memberModel = require('./member.js');
    await memberModel.deleteMany({guild: this.getQuery()._id});
});

module.exports = model('guild', guildSchema);