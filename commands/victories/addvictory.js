const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addvictory")
        .setDescription("ADMIN ONLY. Save a victory")
        .addStringOption((option) =>
            option
                .setName("date")
                .setDescription(
                    "The date of the victory - format MUST be 'yyyy-mm-dd'"
                )
                .setRequired(true)
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
                .setDescription("Optional - an image URL from the victory")
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

        try {
            await interaction.deferReply();

            const date = validateAndFormatDate(dateInput);

            // Initial embed that informs command user how to continue
            const processingEmbed = new EmbedBuilder()
                .setTitle(
                    "Reply to this message with pings of people to include in the victory"
                )
                .setDescription("Processing victory data...")
                .setColor("#10b91f");
            const processingMessage = await interaction.editReply({
                embeds: [processingEmbed],
            });

            // Create collector for the reply with mentions
            const filter = (m) =>
                m.author.id === interaction.user.id &&
                m.reference?.messageId === processingMessage.id;
            const collector = interaction.channel.createMessageCollector({
                filter,
                time: 60000,
                max: 1,
            });

            collector.on("collect", async (message) => {
                const mentions = message.mentions.users.map((user) => user.id);

                // Create victory
                const victory = await crudHandler.createVictory(
                    ragequits,
                    standdowns,
                    terminations,
                    imageUrl,
                    date,
                    mentions
                );

                const successEmbed = new EmbedBuilder()
                    .setDescription(
                        `**SUCCESS** - Victory saved with ID: ${victory.victoryInternalId}`
                    )
                    .setColor("#10b91f");
                await interaction.editReply({ embeds: [successEmbed] });

                // Clean up by deleting the user's reply
                await message.delete();
            });

            // Timeout
            collector.on("end", (collected, reason) => {
                if (reason === "time") {
                    const timeoutEmbed = new EmbedBuilder()
                        .setDescription(
                            "Message timeout: No reply received within 60 seconds"
                        )
                        .setColor("#ff0000");
                    interaction.editReply({ embeds: [timeoutEmbed] });
                }
            });
        } catch (error) {
            // Send a meaningful message
            const errorEmbed = new EmbedBuilder()
                .setDescription(`**ERROR** - ${error}`)
                .setColor("#fc0303");
            await interaction.editReply({
                embeds: [errorEmbed],
            });

            return;
        }
    },
};

function validateAndFormatDate(dateStr) {
    const date = new Date(dateStr);

    // Check if the date is invalid
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format. Must be yyyy-mm-dd");
    }

    // Format the date into 'yyyy-mm-dd' format
    const formattedDate = date.toISOString().split("T")[0];

    return formattedDate;
}
