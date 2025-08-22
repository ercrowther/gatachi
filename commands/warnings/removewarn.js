const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removewarn")
        .setDescription("ADMIN ONLY. Remove a warning from a user")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("The user with the warning")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("warning_id")
                .setDescription("The ID of the user's warning")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {},
};
