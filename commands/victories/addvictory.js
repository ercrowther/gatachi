const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addvictory")
        .addDescription("ADMIN ONLY. Save a victory")
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
                .setName("date")
                .setDescription(
                    "The date of the victory - format MUST be 'yyyy-mm-dd'"
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("imageUrl")
                .setDescription("Optional - an image URL from the victory")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const ragequits = interaction.options.getInteger("ragequits") ?? 0;
        const standdowns = interaction.options.getInteger("standdowns") ?? 0;
        const terminations = interaction.options.getInteger("terminations") ?? 0;
        const date = interaction.options.getString("date");
        const imageUrl = interaction.options.getString("imageUrl");
    },
};
