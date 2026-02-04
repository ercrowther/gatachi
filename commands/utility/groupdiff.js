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

        const loadingEmbed = new EmbedBuilder()
            .setColor("#10b91f")
            .setDescription(
                "**Comparing discord and group members...** - Please wait., this may take a few seconds"
            );
        await interaction.editReply({
            embeds: [loadingEmbed],
            components: [],
        });

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
                    const robloxId = await robloxHandler.getRobloxIDFromNickname(nickname);

                    // If the roblox username is valid for the discord member and they arent in thr group
                    if (robloxId && !groupUserIds.has(robloxId.toString())) {
                        accountGroupDiff.push({
                            robloxUsername:
                                robloxHandler.extractUsername(nickname) ||
                                robloxHandler.extractNick(nickname) ||
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
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    embeds: [errorEmbed],
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    embeds: [errorEmbed],
                    ephemeral: true,
                });
            }

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
