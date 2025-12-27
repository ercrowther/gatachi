require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const paginationHandler = require("../../modules/paginationHandler");

const membersPerPage = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Display a leaderboard of the top gathunters in DW")
        .addStringOption((option) =>
            option
                .setName("range")
                .setDescription(
                    "Optional - Select the range of the leaderboard. Defaults to all"
                )
                .addChoices(
                    {
                        name: "weekly",
                        value: "range_weekly",
                    },
                    {
                        name: "all",
                        value: "range_all",
                    }
                )
        )
        .addStringOption((option) =>
            option
                .setName("board-type")
                .setDescription(
                    "Optional - Select the stats that the leaderboard shows. Defaults to gats-destroyed"
                )
                .addChoices(
                    {
                        name: "victories",
                        value: "type_victories",
                    },
                    {
                        name: "gats-destroyed",
                        value: "type_gats",
                    }
                )
        )
        .addStringOption((option) =>
            option
                .setName("order_by")
                .setDescription(
                    "Optional - Descending is biggest to smallest, and ascending is the opposite"
                )
                .addChoices(
                    {
                        name: "ascending",
                        value: "order_asc",
                    },
                    {
                        name: "descending",
                        value: "order_desc",
                    }
                )
        ),
    async execute(interaction) {
        const guild = interaction.guild;
        const orderMap = {
            order_asc: "ASC",
            order_desc: "DESC",
        };
        // Parse options
        const range = interaction.options.getString("range") ?? "range_all";
        const boardType =
            interaction.options.getString("board-type") ?? "type_gats";
        const orderOption = interaction.options.getString("order_by");
        const orderColumn = orderOption ? orderMap[orderOption] : "DESC";

        try {
            await interaction.deferReply();

            // Get all guild members
            const guildMembers =
                guild.members.cache.size > 0
                    ? guild.members.cache
                    : await guild.members.fetch();
            const nonBotMembers = [...guildMembers.values()].filter(
                (member) => !member.user.bot
            );

            // Paralellize and fetch all victories per member at once
            const victoryPromises = nonBotMembers.map((member) => {
                return crudHandler.fetchVictories(
                    null,
                    "date",
                    "ASC",
                    member.user.id
                );
            });
            const victoriesResults = await Promise.all(victoryPromises);

            // Create an array of members and their victories
            const memberVictories = {};
            nonBotMembers.forEach((member, index) => {
                memberVictories[member.user.id] = victoriesResults[index];
            });

            // Finally create a ordered map of memberVictories
            const orderedMemVictories = Object.entries(memberVictories)
                .map(([id, victories]) => {
                    const now = new Date();
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(now.getDate() - 7);

                    const isWeekly = range === "range_weekly";
                    let filteredVictories = victories;

                    if (isWeekly) {
                        filteredVictories = victories.filter((v) => {
                            const victoryDate = new Date(v.dataValues.date);
                            return victoryDate >= sevenDaysAgo;
                        });
                    }

                    let total;

                    if (boardType === "type_victories") {
                        total = filteredVictories.length;
                    } else {
                        total = filteredVictories.reduce(
                            (sum, v) =>
                                sum +
                                v.dataValues.ragequits +
                                v.dataValues.standdowns +
                                v.dataValues.terminations,
                            0
                        );
                    }

                    return {
                        id,
                        total,
                        victories: filteredVictories,
                    };
                })
                .sort((a, b) =>
                    orderColumn === "ASC"
                        ? a.total - b.total
                        : b.total - a.total
                );

            // Send a paginated embed if there is things to display
            if (orderedMemVictories.length > 0) {
                const leaderboardPages = await buildPages(
                    orderedMemVictories,
                    boardType
                );

                await paginationHandler.paginate(interaction, leaderboardPages);
                return;
            } else {
                const nothingEmbed = new EmbedBuilder()
                    .setDescription(
                        "No victories were found for this leaderboard query!"
                    )
                    .setColor("#10b91f")
                    .setTitle(
                        boardType === "type_victories"
                            ? "Victory Leaderboard"
                            : "Gat Leaderboard"
                    )
                    .setThumbnail(process.env.VICTORY_ICON_URL);

                await interaction.editReply({ embeds: [nothingEmbed] });
                return;
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
 * Build an array of embeds that hold a specified amount of members. Each element acts like a page
 *
 * @param {Object[]} members - An array of [userId] = { victory, victory, ...}
 * @param {string} boardType - Either type_victories or type_gats-destroyed
 * @returns {EmbedBuilder[]} An array of embeds that act as pages
 */
async function buildPages(members, boardType) {
    const medals = ["🥇", "🥈", "🥉"];

    // Hold the members until it is time to add it to a page
    let currentPageInfo = "";
    let pageCount = 1;
    let memberNum = 1;
    const pages = [];

    for (let i = 0; i < members.length; i++) {
        // Conditionally use a medal emoji
        const rank = memberNum <= 3 ? medals[memberNum - 1] : `[${memberNum}]`;
        currentPageInfo += `${rank} - <@${members[i].id}> | `;

        // Decide how to display the total
        if (boardType === "type_victories") {
            currentPageInfo += "Victories: ";
        } else {
            currentPageInfo += "Total Gats: ";
        }
        currentPageInfo += `\`${members[i].total}\`\n\n`;

        memberNum++;

        // If page is full or it’s the last item, add current info into the page
        if ((i + 1) % membersPerPage === 0 || i === members.length - 1) {
            pages.push(
                new EmbedBuilder()
                    .setDescription(currentPageInfo)
                    .setColor("#10b91f")
                    .setTitle(
                        boardType === "type_victories"
                            ? "Victory Leaderboard"
                            : "Gat Leaderboard"
                    )
                    .setThumbnail(process.env.VICTORY_ICON_URL)
                    .setFooter({
                        text: `Page ${pageCount} of ${Math.ceil(
                            members.length / membersPerPage
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
