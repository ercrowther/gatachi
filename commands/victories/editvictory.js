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
        .addIntegerOption((option) =>
            option
                .setName("id")
                .setDescription("The ID of the victory to edit")
                .setRequired(true)
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
        .addBooleanOption((option) =>
            option
                .setName("editmentions")
                .setDescription(
                    "Set to true if you want to edit the victory's mentions"
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Parse command parameters
        const victoryId = interaction.options.getInteger("id");
        const ragequits = interaction.options.getInteger("ragequits");
        const standdowns = interaction.options.getInteger("standdowns");
        const terminations = interaction.options.getInteger("terminations");
        const dateInput = interaction.options.getString("date");
        const imageUrl = interaction.options.getString("image-url");
        const editMentions = interaction.options.getBoolean("editmentions");
        let mentions = null;

        try {
            await interaction.deferReply();

            // Parse date if it was provided
            let date = null;
            if (dateInput) {
                date = victoryUtils.validateAndFormatDate(dateInput);
            }

            if (editMentions) {
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
                    mentions = message.mentions.users
                        .filter(
                            (user) => user.id !== interaction.client.user.id
                        )
                        .map((user) => user.id);

                    // Update the victory
                    await crudHandler.updateVictory(
                        victoryId,
                        ragequits,
                        standdowns,
                        terminations,
                        imageUrl,
                        date,
                        mentions
                    );

                    // Send the success message if it succeeds
                    const successEmbed = new EmbedBuilder()
                        .setDescription(`Victory has been successfully updated`)
                        .setColor("#10b91f");
                    await interaction.editReply({
                        embeds: [successEmbed],
                    });

                    // Clean up by deleting the user's reply
                    await message.delete();
                });
            } else {
                // Update the victory
                await crudHandler.updateVictory(
                    victoryId,
                    ragequits,
                    standdowns,
                    terminations,
                    imageUrl,
                    date,
                    null
                );

                // Send the success message if it succeeds
                const successEmbed = new EmbedBuilder()
                    .setDescription(`Victory has been successfully updated`)
                    .setColor("#10b91f");
                await interaction.editReply({
                    embeds: [successEmbed],
                });
            }
        } catch (error) {
            // Send a meaningful message
            const errorEmbed = new EmbedBuilder()
                .setDescription(`**ERROR** - ${error}`)
                .setColor("#fc0303");
            await interaction.editReply({
                embeds: [errorEmbed],
                ephemeral: true,
            });
        }
    },
};
