const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const robloxHandler = require("../../modules/robloxHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add_flagged_user")
        .setDescription(
            "ADMIN ONLY. Add a 'flagged user' to be detected during a scan"
        )
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("A roblox username")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {},
};
