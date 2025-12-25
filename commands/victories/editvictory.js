const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const victoryUtils = require("../../modules/victoryUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("editvictory")
        .setDescription(
            "ADMIN ONLY. Edit the info for a victory. Omit any parameter to keep original data for it"
        )
        .addStringOption((option) =>
            option
                .setName("date")
                .setDescription(
                    "The date of the victory - format MUST be 'yyyy-mm-dd'"
                )
        )
        .addIntegerOption((option) =>
            option
                .setName("ragequits")
                .setDescription("How many gats ragequit")
                .setMinValue(1)
        )
        .addIntegerOption((option) =>
            option
                .setName("standdowns")
                .setDescription("How many gats stood down")
                .setMinValue(1)
        )
        .addIntegerOption((option) =>
            option
                .setName("terminations")
                .setDescription("How many gats were banned")
                .setMinValue(1)
        )
        .addStringOption((option) =>
            option
                .setName("image-url")
                .setDescription("An image URL from the victory")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Parse command parameters
        const ragequits = interaction.options.getInteger("ragequits") ?? 0;
        const standdowns = interaction.options.getInteger("standdowns") ?? 0;
        const terminations =
            interaction.options.getInteger("terminations") ?? 0;
        const dateInput = interaction.options.getString("date");
        const imageUrl = interaction.options.getString("image-url");
    },
};
