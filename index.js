require("dotenv").config();
// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits } = require("discord.js");
// Require necessary modules for file paths
const fs = require("node:fs");
const path = require("node:path");

// Create a new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
// Attach a command property to the client
client.commands = new Collection();
// Create a collection of cooldowns as a client property
client.cooldowns = new Collection();

// Get the path to the commands folder and the contents of it
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Create a path from the commands folder to the current folder, and then
    // get all javascript files within that folder
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        // Create a path from commands, to current folder, and then to current file. Then, require it
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `⚠️ WARNING: The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

// Get the events folder and all javascript files inside it
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
    // Require each event
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    // Execute each event
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

console.log("▶️ Starting up...");

// Log in to discord using token
client.login(process.env.DISCORD_TOKEN);
