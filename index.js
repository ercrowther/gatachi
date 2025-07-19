require("dotenv").config();
// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require("discord.js");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

console.log("Starting up...");

// This code is ran once the client is ready
client.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ Client is ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to discord using token
client.login(process.env.DISCORD_TOKEN);
