import mongoose from "mongoose";
import env from "../config/env.js";

const app = mongoose.connection;

export const connect = async () => {
  return mongoose.connect(env.MONGOURL).catch(console.error);
};

app.on("error", async (err) => {
  console.error(err);
  await mongoose.disconnect();
});

app.on("disconnected", () => {
  return process.exit();
});
