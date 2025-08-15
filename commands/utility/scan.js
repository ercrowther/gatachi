require("dotenv").config();
const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const robloxHandler = require("../../modules/robloxHandler");

// A map of guild id's to an object of channel and message ids. If a message can be found by it's id,
// then a scan is currently active. If it can't be found, then a scan is not active
const scanMsg = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("scan")
        .setDescription(
            "ADMIN ONLY. Scan a specified roblox account for red flags"
        )
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("A roblox username to scan")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const guild = interaction.guild;
        const guildId = interaction.guildId;
        const username = interaction.options.getString("username");
        let userId = 0;

        setInitialGuildEntry(guildId);

        // Variables for locking the scan command per guild
        const { channelId, messageId } = scanMsg.get(guildId);
        const channel = await guild.channels.fetch(channelId);

        // If a scan is currently active, return early
        if (channelId && channel.messages.fetch(messageId)) {
            // Send a meaningful message
            const lockEmbed = new EmbedBuilder()
                .setDescription(
                    "**REQUEST DENIED** - A scan is already taking place!"
                )
                .setColor("#fc0303");
            await interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true,
            });

            return;
        }

        // Guard clause for making sure the username links to a valid roblox profile
        try {
            userId = await robloxHandler.getIDByUsername(username);
        } catch {
            // Send a meaningful message
            const badUserEmbed = new EmbedBuilder()
                .setDescription(
                    "**CANNOT PRIME SCANNER** - The username does not exist!"
                )
                .setColor("#fc0303");
            await interaction.reply({
                embeds: [badUserEmbed],
                ephemeral: true,
            });

            return;
        }

        // Main scanning logic
        try {
            const scanEmbed = new EmbedBuilder()
                .setTitle("**SCANNER PRIMED**")
                .setColor("#10b91f")
                .setThumbnail(process.env.SCAN_ICON_URL)
                .setDescription(
                    `Prepared to scan ${username}. Please select the scan's thoroughness below.`
                )
                .addFields([
                    {
                        name: "'Friends'",
                        value: "Only the user's ROBLOX friendslist",
                    },
                ]);

            // Create buttons and add them to the embed
            const friendButton = new ButtonBuilder()
                .setCustomId("friends")
                .setLabel("Friends")
                .setStyle(ButtonStyle.Primary);
            const buttonRow = new ActionRowBuilder().addComponents(
                friendButton
            );

            await interaction.reply({
                embeds: [scanEmbed],
                ephemeral: true,
                components: [buttonRow],
                withResponse: true,
            });
        } catch (error) {
            // Send a meaningful message
            const errorEmbed = new EmbedBuilder()
                .setDescription(`**FATAL ERROR** - ${error}`)
                .setColor("#fc0303");
            await interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true,
            });

            return;
        }
    },
};

/**
 * Helper function to make sure the guild always has an entry in scanMsg
 *
 * @param {string} guildId - The guild ID for the guild
 */
function setInitialGuildEntry(guildId) {
    if (!scanMsg.get(guildId)) {
        scanMsg.set(guildId, { channelId: 0, messageId: 0 });
    }
}
