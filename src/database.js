const mongoose = require("mongoose");
const app = mongoose.connection;

const connect = async () => await mongoose.connect(process.env.MONGOURL).catch(console.error);

app.on("error", async err => {
    console.error(err);
    await mongoose.disconnect();
});

app.on("disconnected", () => process.exit());

(async () => await connect())();