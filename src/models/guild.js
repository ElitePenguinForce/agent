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
        ref: 'member',
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
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'member',
    },
});

module.exports = model('guild', guildSchema);