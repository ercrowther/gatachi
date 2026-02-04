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
            "ADMIN ONLY. Scan a specified roblox account for red flags",
        )
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("A roblox username to scan")
                .setRequired(true),
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
                    "**REQUEST DENIED** - A scan is already taking place!",
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
                    "**CANNOT PRIME SCANNER** - The username does not exist!",
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
                    `Prepared to scan ${username}. Please select a scan mode below.`,
                )
                .addFields([
                    {
                        name: "'Normal'",
                        value: "Scan the user's ROBLOX friendslist and then show the flagged users they are friended with",
                    },
                    {
                        name: "'Oracle'",
                        value: "Scan all DW members and then show which members are friended with the user",
                    },
                ])
                .setFooter({
                    text: "Scanning helps, but remember: always use your own judgement",
                });

            // Create buttons and add them to the embed
            const normalButton = new ButtonBuilder()
                .setCustomId("normal")
                .setLabel("Normal")
                .setStyle(ButtonStyle.Primary);
            const oracleButton = new ButtonBuilder()
                .setCustomId("oracle")
                .setLabel("Oracle")
                .setStyle(ButtonStyle.Primary);
            const buttonRow = new ActionRowBuilder().addComponents(
                normalButton,
                oracleButton,
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
                    "**Scanning in progress...** - This may take some time. If it seems frozen, it isn't!",
                )
                .setFooter({
                    text: "Scanning helps, but remember: always use your own judgement",
                });
            await confirmation.update({
                embeds: [loadingEmbed],
                components: [],
            });

            const headshotUrl = await robloxHandler.getHeadshot(userId);

            if (confirmation.customId == "normal") {
                userFriends = await robloxHandler.returnUsersFriends(userId);

                // Make a set of which friends are flagged
                const foundUserFriends = new Set();
                for (const friendId of userFriends) {
                    const foundFriend =
                        await crudHandler.fetchFlaggedUser(friendId);

                    if (foundFriend) {
                        foundUserFriends.add(foundFriend);
                    }
                }

                const accountAge =
                    await robloxHandler.getAccountAgeOfUser(userId);

                // Calculate account violations
                let totalViolations = foundUserFriends.size;
                if (accountAge < 1) {
                    totalViolations += 1;
                }

                const infoEmbed = new EmbedBuilder()
                    .setColor("#10b91f")
                    .setTitle(`**NORMAL SCAN COMPLETE - ${username}**`)
                    .setURL(`https://www.roblox.com/users/${userId}/profile`)
                    .setDescription(
                        "Click the blue text above to go to the user's profile. The information below is a summary of the information gathered from the scan.",
                    )
                    .setThumbnail(headshotUrl)
                    .addFields(
                        {
                            name: "Total Violations",
                            value: totalViolations.toString(),
                        },
                        {
                            name: "Flagged Friends",
                            value: buildStringFromSetOfFlaggedUsers(
                                foundUserFriends,
                            ),
                        },
                        {
                            name: "Account Age",
                            value: accountAge < 1 ? "Young" : "Acceptable",
                        },
                    )
                    .setFooter({
                        text: "Scanning helps, but remember: always use your own judgement",
                    });
                await confirmation.editReply({
                    embeds: [infoEmbed],
                    components: [],
                });
            } else if (confirmation.customId == "oracle") {
                // Get all guild members
                const guildMembers =
                    guild.members.cache.size > 0
                        ? guild.members.cache
                        : await guild.members.fetch();

                // For every member, get their roblox ID if possible and add them to a list
                const foundMembersRobloxIDs = new Map();
                for (const member of guildMembers.values()) {
                    if (!member.user.bot) {
                        const nickname =
                            member.nickname || member.user.username;
                        const robloxId =
                            await robloxHandler.getRobloxIDFromNickname(
                                nickname,
                            );

                        if (robloxId) {
                            foundMembersRobloxIDs.set(robloxId, nickname);
                        }
                    }
                }

                // Get the scanned user's friends list
                const scannedUserFriends =
                    await robloxHandler.returnUsersFriends(userId);

                // Check which DW members are friends with the scanned user
                const membersWhoareFriends = new Map();
                for (const [
                    memberId,
                    memberNickname,
                ] of foundMembersRobloxIDs) {
                    if (scannedUserFriends.has(memberId)) {
                        membersWhoareFriends.set(memberId, memberNickname);
                    }
                }

                // Build the description string with the members who are friends
                let descriptionString =
                    "Click the blue text above to go to the user's profile. The following list of names below are the DW members who are friended to this user's ROBLOX profile:\n\n";

                if (membersWhoareFriends.size > 0) {
                    const membersList = Array.from(
                        membersWhoareFriends.values(),
                    ).join(", ");
                    descriptionString += membersList;
                } else {
                    descriptionString += "None found";
                }

                // Reverse scan mode
                const reverseEmbed = new EmbedBuilder()
                    .setColor("#10b91f")
                    .setTitle(`**ORACLE SCAN COMPLETE - ${username}**`)
                    .setURL(`https://www.roblox.com/users/${userId}/profile`)
                    .setThumbnail(headshotUrl)
                    .setDescription(descriptionString)
                    .setFooter({
                        text: "Scanning helps, but remember: always use your own judgement",
                    });
                await confirmation.editReply({
                    embeds: [reverseEmbed],
                    components: [],
                });
            }

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
