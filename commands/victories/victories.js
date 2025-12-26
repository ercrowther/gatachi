const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const paginationHandler = require("../../modules/paginationHandler");

const victoriesPerPage = 15;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("victories")
        .setDescription("View all of DW's victories")
        .addStringOption((option) =>
            option
                .setName("sort_by")
                .setDescription("Optional - Select a field to sort by")
                .addChoices(
                    {
                        name: "ragequits",
                        value: "sort_ragequits",
                    },
                    {
                        name: "standdowns",
                        value: "sort_standdowns",
                    },
                    {
                        name: "terminations",
                        value: "sort_terminations",
                    },
                    {
                        name: "date",
                        value: "sort_date",
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
        // Create maps for sorting and ordering
        const sortMap = {
            sort_ragequits: "ragequits",
            sort_standdowns: "standdowns",
            sort_terminations: "terminations",
            sort_date: "date",
        };
        const orderMap = {
            order_asc: "ASC",
            order_desc: "DESC",
        };

        // Parse options
        const sortOption =
            interaction.options.getString("sort_by") ?? undefined;
        const orderOption =
            interaction.options.getString("order_by") ?? undefined;
        // Translate options to db columns
        const sortColumn = sortOption ? sortMap[sortOption] : undefined;
        const orderColumn = orderOption ? orderMap[orderOption] : undefined;

        try {
            const victories = await crudHandler.fetchVictories(
                null,
                sortColumn,
                orderColumn,
                null
            );

            // Send a paginated embed
            const victoryPages = await buildPages(victories);
            await paginationHandler.paginate(interaction, victoryPages);

            return;
        } catch (error) {
            // Send a meaningful message
            const errorEmbed = new EmbedBuilder()
                .setDescription(`**ERROR** - ${error}`)
                .setColor("#fc0303");
            await interaction.reply({
                embeds: [errorEmbed],
            });

            return;
        }
    },
};

/**
 * Build an array of embeds that hold a specified amount of victories. Each element acts like a page
 *
 * @param {Object[]} victories - An array of Victory objects
 * @returns {EmbedBuilder[]} An array of embeds that act as pages
 */
async function buildPages(victories) {
    // Hold the victories until it is time to add it to a page
    let currentPageInfo = "";
    let pageCount = 1;
    const pages = [];

    for (let i = 0; i < victories.length; i++) {
        // Cache victory data
        const id = victories[i].dataValues.victoryInternalId;
        const ragequits = victories[i].dataValues.ragequits;
        const standdowns = victories[i].dataValues.standdowns;
        const terminations = victories[i].dataValues.terminations;
        const date = victories[i].dataValues.date;
        const imageUrl = victories[i].dataValues.imageUrl;

        // Fill out victory entry
        currentPageInfo += `ID: \`${id}\` | ${ragequits} RQ's, ${standdowns} standdowns, and ${terminations} terminations | \`${date}\``;
        if (imageUrl) {
            currentPageInfo += " | *contains image*";
        }
        currentPageInfo += "\n\n";

        // If page is full or it’s the last item, add current info into the page
        if ((i + 1) % victoriesPerPage === 0 || i === victories.length - 1) {
            pages.push(
                new EmbedBuilder()
                    .setDescription(currentPageInfo)
                    .setColor("#10b91f")
                    .setTitle("Victories")
                    .setFooter({
                        text: `Page ${pageCount} of ${Math.ceil(
                            victories.length / victoriesPerPage
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
