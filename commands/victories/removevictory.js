const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removevictory")
        .setDescription("ADMIN ONLY. Permanently remove a victory")
        .addIntegerOption((option) =>
            option
                .setName("id")
                .setDescription("The ID for the victory")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const victoryId = interaction.options.getInteger("id");

        try {
            await crudHandler.deleteVictory(victoryId);

            const successEmbed = new EmbedBuilder()
                .setColor("#10b91f")
                .setDescription("The victory has been deleted");
            await interaction.reply({
                embeds: [successEmbed],
                ephemeral: true,
            });

            return;
        } catch (error) {
            // Send a meaningful message
            const errorEmbed = new EmbedBuilder()
                .setDescription(`**ERROR** - ${error}`)
                .setColor("#fc0303");
            await interaction.reply({
                embeds: [errorEmbed],
            });

            return;
        }
    },
};
