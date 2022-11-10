const { model, Schema } = require('mongoose');
const config = require('../config');

const constantsSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  lastGuildsChannelUpdate: {
    type: Date,
    default: new Date()
  },
  updatingGuildsChannel: {
    type: Boolean,
    default: false
  }
});

constantsSchema.statics.getConstants = async function() {
  return await this.findById(config.agent) || await this.create({ _id: config.agent })
}

constantsSchema.statics.updateConstants = async function(data) {
  return await this.findByIdAndUpdate(config.agent, data, { new: true, upsert: true })
}

module.exports = model('constants', constantsSchema);