const mongoose = require("mongoose");
const app = mongoose.connection;

const connect = async () => {
    return await mongoose.connect(`${process.env.MONGOURL}?retryWrites=true&w=majority`, {useNewUrlParser: true});
}

app.on("error", () => mongoose.disconnect());

app.on("disconnected", async () => await connect());

(async () => await connect())();