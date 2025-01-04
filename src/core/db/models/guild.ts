import { type InferSchemaType, type Model, model, Schema } from "mongoose";
import type { MemberSchemaType } from "./member.js";

const GuildSchema = new Schema({
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
    match: /^[\w-]+$/,
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

export type GuildSchemaType = InferSchemaType<typeof GuildSchema>;
export type GuildModelType = Model<typeof GuildSchema>;

GuildSchema.pre("findOneAndDelete", async function () {
  const memberModel = (await import(
    "./member.js"
  )) as unknown as Model<MemberSchemaType>; // shitty type checking
  await memberModel.deleteMany({ guild: this.getQuery()._id });
});

export default model("guild", GuildSchema);
