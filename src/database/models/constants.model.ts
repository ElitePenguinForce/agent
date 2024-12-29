import { type InferSchemaType, model, Schema } from "mongoose";
import config from "../../config";

const ConstantsSchema = new Schema(
  {
    _id: {
      type: String,
      match: /^\d{17,19}$/,
    },
    lastGuildsChannelUpdate: {
      type: Date,
      default: new Date(),
    },
    updatingGuildsChannel: {
      type: Boolean,
      default: false,
    },
    scheduledUpdate: {
      type: Boolean,
    },
    updateLogs: {
      type: [String],
      default: () => {
        return [];
      },
    },
  },
  {
    statics: {
      async getConstants() {
        return (
          (await this.findById(config.ids.agent)) ||
          (await this.create({ _id: config.ids.agent }))
        );
      },
      async updateConstants(data) {
        return await this.updateOne({ _id: config.ids.agent }, data, {
          new: true,
          upsert: true,
          setDefaultOnInsert: true,
        });
      },
    },
  },
);

export type ConstantsSchemaType = InferSchemaType<typeof ConstantsSchema>;

ConstantsSchema.statics.getConstants = async function () {
  return (
    (await this.findById(config.ids.agent)) ||
    (await this.create({ _id: config.ids.agent }))
  );
};

ConstantsSchema.statics.updateConstants = async function (data) {
  return await this.updateOne({ _id: config.ids.agent }, data, {
    new: true,
    upsert: true,
    setDefaultOnInsert: true,
  });
};

export default model("constants", ConstantsSchema);