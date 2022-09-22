require("dotenv").config();

const { token } = process.env;
const { Client, Collection, GatewayIntentBits } = require('discord.js')
const fs = require('fs');

const { initializeApp } = require("firebase/app");


const firebaseConfig = {

    apiKey: "AIzaSyDO__0ao-Tvme8a2bTm8v7s1PuTgjWRn_8",
    authDomain: "epfserver-36135.firebaseapp.com",
    databaseURL: "https://epfserver-36135-default-rtdb.firebaseio.com",
    projectId: "epfserver-36135",
    storageBucket: "epfserver-36135.appspot.com",
    messagingSenderId: "617307382338",
    appId: "1:617307382338:web:3de8d94e188374102903db"
  

};

const client = new Client({ intents: GatewayIntentBits.Guilds });
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.commandArray = [];


const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
    const functionFiles = fs.readdirSync(`./src/functions/${folder}`).filter(file => file.endsWith('.js'));

    for (const file of functionFiles) require(`./functions/${folder}/${file}`)(client);
}


client.handleEvents();
client.handleCommands();
client.handleComponents();

const app = initializeApp(firebaseConfig);

client.login(token);