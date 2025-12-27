const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const victoryUtils = require("../../modules/victoryUtils");

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

        // Define buttons
        const continueButton = new ButtonBuilder()
            .setCustomId("continue")
            .setLabel("Continue")
            .setStyle(ButtonStyle.Success);
        const cancelButton = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(
            continueButton,
            cancelButton
        );

        try {
            await interaction.deferReply();

            const date = victoryUtils.validateAndFormatDate(dateInput);

            // Check if a victory has been added on current date
            const victoryExists = await crudHandler.checkVictoryExistsOnDate(
                date
            );

            if (victoryExists) {
                // Send a confirmation dialog if user really wants to cintinue
                const confirmEmbed = new EmbedBuilder()
                    .setTitle("HOLD IT!")
                    .setDescription(
                        `A victory has already been saved for **${date}**. Are you sure you want to continue with adding this victory?`
                    )
                    .setColor("#ffac32");

                const confirmMessage = await interaction.editReply({
                    embeds: [confirmEmbed],
                    components: [row],
                });

                // Wait for button interaction
                try {
                    const confirmation =
                        await confirmMessage.awaitMessageComponent({
                            filter: (i) => i.user.id === interaction.user.id,
                            time: 60000,
                        });

                    if (confirmation.customId === "cancel") {
                        confirmMessage.delete();

                        return;
                    }
                } catch {
                    // Timeout
                    const timeoutEmbed = new EmbedBuilder()
                        .setDescription(
                            "Message timeout: No reply received within 60 seconds"
                        )
                        .setColor("#ff0000");
                    await interaction.editReply({
                        embeds: [timeoutEmbed],
                        components: [],
                    });

                    return;
                }
            }

            // Initial embed that informs command user how to continue
            const processingEmbed = new EmbedBuilder()
                .setTitle(
                    "Reply to this message with pings of people to include in the victory"
                )
                .setDescription("Processing victory data...")
                .setColor("#10b91f");
            const processingMessage = await interaction.editReply({
                embeds: [processingEmbed],
                components: [],
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
                const mentions = message.mentions.users
                    .filter((user) => user.id !== interaction.client.user.id)
                    .map((user) => user.id);

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
