require("dotenv").config();
// Require the necessary discord.js classes
const {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    MessageFlags,
} = require("discord.js");
// Require necessary modules for file paths
const fs = require("node:fs");
const path = require("node:path");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// Attach a command property to the client
client.commands = new Collection();

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

// For every interaction that is a slash command only
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // Try and get the command from the client commands collection by it's interaction name
    const command = interaction.client.commands.get(interaction.commandName);

    // If the command is not within the command property
    if (!command) {
        console.error(
            `❌ ERROR: No command matching ${interaction.commandName} was found.`
        );
        return;
    }

    // Call the command's execute function and pass it the interaction
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ ERROR: ${error}`);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content:
                    "❌ ERROR: There was an unknown error while executing this command!",
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content:
                    "❌ ERROR: There was an unknown error while executing this command!",
                flags: MessageFlags.Ephemeral,
            });
        }
    }
});

console.log("▶️ Starting up...");

// This code is ran once the client is ready
client.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ Client is ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to discord using token
client.login(process.env.DISCORD_TOKEN);
