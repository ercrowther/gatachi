const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const paginationHandler = require("../../modules/paginationHandler");

const namesPerPage = 15;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("flaggedusers")
        .setDescription(
            "ADMIN ONLY. Get a list of all flagged users that are checked during the scan command"
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const users = await crudHandler.fetchAllFlaggedUsers();
        const pages = await buildPages(users);

        await paginationHandler.paginate(interaction, pages);
    },
};

/**
 * Build an array of embeds that hold a specified amount of names. Each element acts like a page
 *
 * @param {Object[]} users - An array of FlaggedUser objects
 * @returns {EmbedBuilder[]} An array of embeds that act as pages
 */
function buildPages(users) {
    // Hold the names of each FlaggedUser until it is time to add it to a page
    let currentPageInfo = "";
    let pageCount = 1;
    const pages = [];

    for (let i = 0; i < users.length; i++) {
        currentPageInfo += `${users[i].dataValues.name}\n`;

        // If page is full or it’s the last item, add current info into the page
        if ((i + 1) % namesPerPage === 0 || i === users.length - 1) {
            pages.push(
                new EmbedBuilder()
                    .setDescription(currentPageInfo)
                    .setColor("#10b91f")
                    .setTitle("Flagged Users")
                    .setFooter({
                        text: `Page ${pageCount} of ${Math.ceil(
                            (users.length - 1) / namesPerPage
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
