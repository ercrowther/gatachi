const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const paginationHandler = require("../../modules/paginationHandler");

const namesPerPage = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("flaggedusers")
        .setDescription(
            "Get a list of all flagged users that are checked during the scan command"
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const pages = await buildPages();

        await paginationHandler.paginate(interaction, pages);
    },
};

/**
 * Build an array of embeds that hold a specified amount of names. Each element acts like a page
 *
 * @returns {EmbedBuilder[]} An array of embeds that act as pages
 */
async function buildPages() {
    // Hold the names of each FlaggedUser until it is time to add it to a page
    let currentPageInfo = "";
    const users = await crudHandler.fetchAllFlaggedUsers();
    const pages = [];

    for (let i = 0; i < users.length; i++) {
        currentPageInfo += `${users.dataValues.name}\n`;

        // If page is full or it’s the last item, add current info into the page
        if ((i + 1) % namesPerPage === 0 || i === users.length - 1) {
            pages.push(new EmbedBuilder().setDescription(currentPageInfo));

            // Flush the current page info
            currentPageInfo = "";
        }
    }

    return pages;
}
