require("dotenv").config();
const path = require("node:path");
const { REST, Routes } = require("discord.js");

const fileArg = process.argv[2];

if (!fileArg) {
    console.error("❌ ERROR: No command file path provided.");
    console.error("Usage: node deploy-one.js <path-to-command-file>");
    process.exit(1);
}

// Resolve absolute path so require() behaves predictably
const commandPath = path.resolve(process.cwd(), fileArg);

let command;
try {
    command = require(commandPath);
} catch (err) {
    console.error(`❌ ERROR: Failed to load command file:\n${commandPath}`);
    console.error(err);
    process.exit(1);
}

if (!command.data || !command.execute) {
    console.error("❌ ERROR: Command must export both `data` and `execute`.");
    process.exit(1);
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🔄 Deploying single command: /${command.data.name}`);

        const data = await rest.post(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: command.data.toJSON() }
        );

        console.log(`✅ Successfully deployed /${data.name}`);
    } catch (error) {
        console.error("❌ ERROR deploying command:");
        console.error(error);
    }
})();
