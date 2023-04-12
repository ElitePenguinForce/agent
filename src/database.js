const mongoose = require("mongoose");
const app = mongoose.connection;

const connect = async () => {
    return await mongoose.connect(`${process.env.MONGOURL}?retryWrites=true&w=majority`, {useNewUrlParser: true});
}

app.on("error", async err => {
    console.error(err);
    await mongoose.disconnect();
});

app.on("disconnected", () => process.exit());

(async () => await connect())();