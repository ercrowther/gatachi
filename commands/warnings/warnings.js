const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const paginationHandler = require("../../modules/paginationHandler");

const warnsPerPage = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warnings")
        .setDescription(
            "ADMIN ONLY. View all warnings or warnings for a specific user"
        )
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription(
                    "Optional - Omit this to view warnings for everyone in the server"
                )
        )
        .addStringOption((option) =>
            option
                .setName("sort_by")
                .setDescription("Optional - Select a field to sort by")
                .addChoices(
                    {
                        name: "date",
                        value: "sort_date",
                    },
                    {
                        name: "severity",
                        value: "sort_severity",
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
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Map choice value's to the columns in warnings
        const sortMap = {
            sort_date: "date",
            sort_severity: "severity",
        };

        const orderMap = {
            order_asc: "ASC",
            order_desc: "DESC",
        };

        const guildId = interaction.guildId;
        // Parse options
        const target = interaction.options.getUser("user");
        const targetId = target?.id;
        const sortOption =
            interaction.options.getString("sort_by") ?? undefined;
        const orderOption =
            interaction.options.getString("order_by") ?? undefined;
        // Translate options to db columns
        const sortColumn = sortOption ? sortMap[sortOption] : undefined;
        const orderColumn = orderOption ? orderMap[orderOption] : undefined;

        // Show user specific warnings
        if (targetId) {
            const userWarns = await crudHandler.fetchWarnings(
                guildId,
                sortColumn,
                orderColumn,
                targetId
            );

            // Send a paginated embed
            const userWarnPages = buildPages(userWarns, target);
            await paginationHandler.paginate(interaction, userWarnPages);

            return;
        }

        // Show warning's for everyone
    },
};

/**
 * Build an array of embeds that hold a specified amount of warnings. Each element acts like a page
 *
 * @param {Object[]} warnings - An array of Warning objects
 * @param {GuildMember} targetId - An optional parameter for a guild member
 * @returns {EmbedBuilder[]} An array of embeds that act as pages
 */
function buildPages(warnings, target) {
    // Hold the warnings until it is time to add it to a page
    let currentPageInfo = "";
    let pageCount = 1;
    const pages = [];

    for (let i = 0; i < warnings.length; i++) {
        // Parse a few datas from the element
        const reason = warnings[i].dataValues.reasoning
            ? warnings[i].dataValues.reasoning
            : "No reason provided";
        const date = new Date(warnings[i].dataValues.date);

        // Add one line of warning info
        currentPageInfo += `ID: \`${warnings[i].dataValues.warningId}\``;
        if (!target) {
            currentPageInfo += ` | ${target.username}`;
        }
        currentPageInfo += ` | Severity: \`${
            warnings[i].dataValues.severity
        }\`\n${reason}  -  \`${date.toString()}\`\n\n`;

        // If page is full or it’s the last item, add current info into the page
        if ((i + 1) % warnsPerPage === 0 || i === warnings.length - 1) {
            pages.push(
                new EmbedBuilder()
                    .setDescription(currentPageInfo)
                    .setColor("#10b91f")
                    .setTitle(
                        target ? `${target.username}'s Warnings` : "Warnings"
                    )
                    .setFooter({
                        text: `Page ${pageCount} of ${Math.ceil(
                            warnings.length / warnsPerPage
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
