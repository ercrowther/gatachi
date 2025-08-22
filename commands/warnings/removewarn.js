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
                .setMinValue(1)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Get necessary data for deletion
        const guildId = interaction.guildId;
        const userId = interaction.options.getUser("user").id;
        const warningId = interaction.options.getInteger("warning_id");

        try {
            await crudHandler.deleteWarning(guildId, userId, warningId);

            const successEmbed = new EmbedBuilder().setDescription(
                `Warning with ID \`${warningId}\` successfully deleted!`
            );

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            // Send a meaningful message
            const errorEmbed = new EmbedBuilder()
                .setDescription(`${error}`)
                .setColor("#fc0303");
            await interaction.reply({
                embeds: [errorEmbed],
            });

            return;
        }
    },
};
