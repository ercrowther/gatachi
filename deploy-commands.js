require("dotenv").config();
// Require necessary modules for file paths
const fs = require("node:fs");
const path = require("node:path");
// Require the necessary discord.js classes
const { REST, Routes } = require("discord.js");

const commands = [];

// Get all command sub folders within the command folder
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Get the all javascript files for the current folder
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));

    // Get the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        // Create a path from commands, to current folder, and then to current file. Then, require it
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(
                `⚠️ WARNING: The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy all commands
(async () => {
    try {
        console.log(
            `🔄 Started refreshing ${commands.length} application (/) commands.`
        );

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log(
            `✅ Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(`❌ ERROR: ${error}`);
    }
})();
