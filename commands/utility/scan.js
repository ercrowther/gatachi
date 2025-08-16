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

        // Check if a scan message currently exists
        let messageExists = false;
        if (channel) {
            try {
                const message = await channel.messages.fetch(messageId);
                if (message) {
                    messageExists = true;
                }
            } catch {
                messageExists = false;
            }
        }

        // If a scan message currently exists, a scan is active. Do not continue
        if (messageExists) {
            const lockEmbed = new EmbedBuilder()
                .setDescription(
                    "**REQUEST DENIED** - A scan is already taking place!"
                )
                .setColor("#fc0303");
            await interaction.reply({ embeds: [lockEmbed], ephemeral: true });

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
                ])
                .setFooter({
                    text: "Scanning helps, but remember: always use your own judgement",
                });

            // Create buttons and add them to the embed
            const friendButton = new ButtonBuilder()
                .setCustomId("friends")
                .setLabel("Friends")
                .setStyle(ButtonStyle.Primary);
            const buttonRow = new ActionRowBuilder().addComponents(
                friendButton
            );

            const sentMessage = await interaction.reply({
                embeds: [scanEmbed],
                components: [buttonRow],
                withResponse: true,
            });

            // Set the channel and message id for the guild, 'locking' the scan command
            scanMsg.set(guildId, {
                channelId: sentMessage.resource.message.channelId,
                messageId: sentMessage.resource.message.id,
            });

            // Collect the button interaction
            const collectorFilter = (i) => i.user.id === interaction.user.id;
            const confirmation =
                await sentMessage.resource.message.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 900000,
                });

            // Variables to hold all the gotten data
            let userFriends = new Set();

            const loadingEmbed = new EmbedBuilder()
                .setColor("#10b91f")
                .setDescription(
                    "**Scanning in progress...** - Please wait. At a worse case, this can take up to 20 seconds"
                )
                .setFooter({
                    text: "Scanning helps, but remember: always use your own judgement",
                });
            await confirmation.update({
                embeds: [loadingEmbed],
                components: [],
            });

            if (confirmation.customId == "friends") {
                userFriends = await robloxHandler.returnUsersFriends(userId);
            }

            // Make a set of which friends are flagged
            const foundUserFriends = new Set();
            for (const friendId of userFriends) {
                const foundFriend = await crudHandler.fetchFlaggedUser(
                    friendId
                );

                if (foundFriend) {
                    foundUserFriends.add(foundFriend);
                }
            }

            const headshotUrl = await robloxHandler.getHeadshot(userId);
            const infoEmbed = new EmbedBuilder()
                .setColor("#10b91f")
                .setTitle("**SCAN COMPLETE!**")
                .setURL(`https://www.roblox.com/users/${userId}/profile`)
                .setDescription(
                    "Click the blue text above to go to the user's profile. The information below is a summary of the information gathered from the scan."
                )
                .setThumbnail(headshotUrl)
                .addFields(
                    {
                        name: "Total Violations",
                        value: foundUserFriends.size.toString(),
                    },
                    {
                        name: "Flagged Friends",
                        value: buildStringFromSetOfFlaggedUsers(
                            foundUserFriends
                        ),
                    }
                )
                .setFooter({
                    text: "Scanning helps, but remember: always use your own judgement",
                });
            await confirmation.editReply({
                embeds: [infoEmbed],
                components: [],
            });

            scanMsg.delete(guildId);
        } catch (error) {
            // Send a meaningful message
            const errorEmbed = new EmbedBuilder()
                .setDescription(`**FATAL ERROR** - ${error}`)
                .setColor("#fc0303");
            await interaction.editReply({
                embeds: [errorEmbed],
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
        scanMsg.set(guildId, { channelId: null, messageId: null });
    }
}

/**
 * Given a set of FlaggedUsers, make a string of their names. The string returned will be "None found" if empty set.
 *
 * @param {Set<FlaggedUser>} set - A set containing flagged users
 * @returns {string} A string of the flagged user's names
 */
function buildStringFromSetOfFlaggedUsers(set) {
    let string = "";

    string = Array.from(set)
        .map((friend) => friend.name)
        .join(", ");

    if (string.length == 0) {
        string = "None found";
    }

    return string;
}
