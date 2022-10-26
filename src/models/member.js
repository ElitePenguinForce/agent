const {Schema, model} = require('mongoose');

const memberSchema = new Schema({
    user: {
        type: String,
        match: /^\d{17,19}$/,
        required: true,
        index: true,
    },
    guild: {
        type: String,
        match: /^\d{17,19}$/,
        ref: 'guild',
        required: true,
        index: true,
    },
    admin: Boolean,
});

module.exports = model('member', memberSchema);