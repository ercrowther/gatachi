require("dotenv").config();
const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const paginationHandler = require("../../modules/paginationHandler");
const robloxHandler = require("../../modules/robloxHandler");

const namesPerPage = 15;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("groupdiff")
        .setDescription(
            "ADMIN ONLY. List all roblox accounts in the discord but not in the ROBLOX group"
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({});

        const guild = interaction.guild;
        // ROBLOX account names for the group difference
        const accountGroupDiff = [];
        // ROBLOX account names that are actually in the group
        let groupAccountNames = [];

        try {
            // Get all guild members
            const guildMembers = await guild.members.fetch();
            // Get all account names in the DW group
            groupAccountNames = await robloxHandler.getUsersInGroup(
                process.env.GROUP_ID
            );
            // Extract all Roblox IDs in the group
            const groupUserIds = new Set(
                groupAccountNames.data.map((u) => u.user.userId.toString())
            );

            // Get all guild member roblox names that arent in the group
            for (const member of guildMembers.values()) {
                // Only process non-bot members
                if (!member.user.bot) {
                    const nickname = member.nickname || member.user.username;
                    const robloxId = await getRobloxIDFromNickname(nickname);

                    // If the roblox username is valid for the discord member and they arent in thr group
                    if (robloxId && !groupUserIds.has(robloxId.toString())) {
                        accountGroupDiff.push({
                            robloxUsername:
                                extractUsername(nickname) ||
                                extractNick(nickname) ||
                                nickname,
                        });
                    }
                }
            }

            // Create a paginated response if there is no accounts
            if (accountGroupDiff.length == 0) {
                const responseEmbed = new EmbedBuilder()
                    .setDescription(
                        `Every discord user is in the ROBLOX group! - This is cause for celeberation!!`
                    )
                    .setColor("#10b91f");
                await interaction.editReply({
                    embeds: [responseEmbed],
                });

                return;
            } else {
                const pages = await buildPages(accountGroupDiff);
                await paginationHandler.paginate(interaction, pages);
            }
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

/**
 * Build an array of embeds that hold a specified amount of names. Each element acts like a page
 *
 * @param {Object[]} users - An array of ROBLOX usernames
 * @returns {EmbedBuilder[]} An array of embeds that act as pages
 */
function buildPages(users) {
    // Hold the names of each ROBLOX user until it is time to add it to a page
    let currentPageInfo = "";
    let pageCount = 1;
    const pages = [];

    for (let i = 0; i < users.length; i++) {
        currentPageInfo += `${users[i].robloxUsername}\n`;

        // If page is full or it’s the last item, add current info into the page
        if ((i + 1) % namesPerPage === 0 || i === users.length - 1) {
            pages.push(
                new EmbedBuilder()
                    .setDescription(currentPageInfo)
                    .setColor("#10b91f")
                    .setTitle("Accounts In Discord And Not Group")
                    .setFooter({
                        text: `Page ${pageCount} of ${Math.ceil(
                            users.length / namesPerPage
                        )}`,
                    })
            );
            pageCount += 1;

            // Flush the current page info
            currentPageInfo = "";
        }
    }

    return pages;
}

/**
 * Retrieve the ROBLOX username from a guild member's nickname
 *
 * @param {string} nickname - The discord nickname of a guild member
 * @returns {string|null} A string containing the ROBLOX username of the member, otherwise null
 */
function extractUsername(nickname) {
    const match = nickname.match(/\(([^)]+)\)$/);
    return match ? match[1] : null;
}

/**
 * Retrieve the preferred name of a guild member's nickname. Useful to fall back on if
 * the ROBLOX username doesn't exist
 *
 * @param {string} nickname - The discord nickname of a guild membe
 * @returns {string|null} A string containing the preferred name of the member, otherwise null
 */
function extractNick(nickname) {
    const match = nickname.match(/^(.*?)\s*\(/);
    return match ? match[1].trim() : null;
}

/**
 * Retrieve the ROBLOX id from a guild member's name
 *
 * @param {string} nickname - The member's nickname
 * @returns {Promise<string|null>} The Roblox ID if found, otherwise null
 */
async function getRobloxIDFromNickname(nickname) {
    let memberId = null;

    // Attempt 1: Roblox username from the parentheses in the nickname
    if (extractUsername(nickname)) {
        memberId = await robloxHandler
            .getIDByUsername(extractUsername(nickname))
            .catch(() => null);
    }

    // Attempt 2: The preferred name of the guild member outside of parentheses
    if (!memberId && extractNick(nickname)) {
        memberId = await robloxHandler
            .getIDByUsername(extractNick(nickname))
            .catch(() => null);
    }

    // Attempt 3: Whole nickname of guild member
    if (!memberId && nickname) {
        memberId = await robloxHandler
            .getIDByUsername(nickname)
            .catch(() => null);
    }

    return memberId;
}
