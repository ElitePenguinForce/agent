import { type InferSchemaType, type Model, model, Schema } from "mongoose";
import type { GuildSchemaType } from "./guild.js";

const MemberSchema = new Schema({
  user: {
    type: String,
    match: /^\d{17,19}$/,
    required: true,
    index: true,
  },
  guild: {
    type: String,
    match: /^\d{17,19}$/,
    ref: "guild",
    required: true,
    index: true,
  },
  admin: Boolean,
});

export type MemberSchemaType = InferSchemaType<typeof MemberSchema>;
export type MemberModelType = Model<typeof MemberSchema>;
export type GuildPopulatedMemberSchemaType = Omit<MemberSchemaType, "guild"> & {
  guild: GuildSchemaType;
};

export default model("member", MemberSchema);
