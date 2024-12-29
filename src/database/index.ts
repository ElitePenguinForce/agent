import mongoose from "mongoose";
import env from "../env";

const app = mongoose.connection;

const connect = async () => {
  return mongoose.connect(env.MONGOURL).catch(console.error);
};

app.on("error", async (err) => {
  console.error(err);
  await mongoose.disconnect();
});

app.on("disconnected", () => {
  return process.exit();
});

const database = {
  connect,
};

export default database;
