require("dotenv").config();
const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

// Discord Owner ID - set this to the owner's Discord user ID
const DISCORD_OWNER_ID = process.env.DISCORD_OWNER_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clearwarn")
        .setDescription("ADMIN ONLY. Clear warnings for a user or everyone")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Optional - The user to clear warnings for")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // Get necessary data for deletion
        const guildId = interaction.guildId;
        const commandUser = interaction.user.id;
        const targetUser = interaction.options.getUser("user");

        try {
            // If a specific user is provided, clear their warnings
            if (targetUser) {
                const targetUserId = targetUser.id;
                const targetUsername = targetUser.username;

                await crudHandler.clearAllWarningsForUser(
                    guildId,
                    targetUserId
                );

                const successEmbed = new EmbedBuilder()
                    .setTitle(`**WARNINGS CLEARED!**`)
                    .setColor("#10b91f")
                    .setDescription(
                        `All warnings for ${targetUsername} have been cleared.`
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [successEmbed] });
                return;
            }

            // If no user is provided, check if the user is the owner
            if (commandUser !== DISCORD_OWNER_ID) {
                const errorEmbed = new EmbedBuilder()
                    .setDescription(
                        "Only the server owner can clear all warnings!"
                    )
                    .setColor("#fc0303");
                await interaction.editReply({ embeds: [errorEmbed] });
                return;
            }

            // Create confirmation prompt with buttons
            const confirmEmbed = new EmbedBuilder()
                .setTitle("**HOLD IT!**")
                .setColor("#ffac32")
                .setDescription(
                    "Are you sure you want to clear **ALL warnings** for the entire guild? This action is irreversable - maybe you meant to clear warnings for a single user?"
                );

            const confirmRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("confirm_clear_all_warnings")
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("cancel_clear_all_warnings")
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.editReply({
                embeds: [confirmEmbed],
                components: [confirmRow],
            });

            // Wait for button interaction
            const buttonFilter = (i) =>
                i.user.id === commandUser &&
                (i.customId === "confirm_clear_all_warnings" ||
                    i.customId === "cancel_clear_all_warnings");

            try {
                const buttonInteraction = await interaction.channel.awaitMessageComponent(
                    { filter: buttonFilter, time: 30000 }
                );

                if (buttonInteraction.customId === "cancel_clear_all_warnings") {
                    const cancelEmbed = new EmbedBuilder()
                        .setDescription("Action cancelled.")
                        .setColor("#fc0303");

                    await buttonInteraction.update({
                        embeds: [cancelEmbed],
                        components: [],
                    });
                    return;
                }

                // Confirm was clicked - clear all warnings
                await crudHandler.clearAllWarningsForGuild(guildId);

                const successEmbed = new EmbedBuilder()
                    .setTitle(`**ALL WARNINGS CLEARED**`)
                    .setColor("#10b91f")
                    .setDescription(`All warnings for the guild have been cleared.`)
                    .setTimestamp();

                await buttonInteraction.update({
                    embeds: [successEmbed],
                    components: [],
                });
            } catch (error) {
                // No button response in 30 seconds
                if (error.code === "InteractionCollectorError") {
                    const timeoutEmbed = new EmbedBuilder()
                        .setDescription("Confirmation timed out.")
                        .setColor("#fc0303");

                    await interaction.editReply({
                        embeds: [timeoutEmbed],
                        components: [],
                    });
                }
                return;
            }
        } catch (error) {
            // Send a meaningful message
            const errorEmbed = new EmbedBuilder()
                .setDescription(`${error}`)
                .setColor("#fc0303");
            await interaction.editReply({
                embeds: [errorEmbed],
            });

            return;
        }
    },
};
