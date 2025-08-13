const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const robloxHandler = require("../../modules/robloxHandler");

// A map of guild id's to message ids. If a message can be found by it's id, then a scan is currently
// active. If it can't be found, then a scan is not active
const scanMsg = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("scan")
        .setDescription(
            "ADMIN ONLY. Scan a specified roblox account for red flags"
        )
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("A roblox username to scan")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {},
};
