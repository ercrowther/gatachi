const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const paginationHandler = require("../../modules/paginationHandler");
const generalUtils = require("../../modules/generalUtils");

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

        try {
            // Show user specific warnings
            if (targetId) {
                const userWarns = await crudHandler.fetchWarnings(
                    guildId,
                    sortColumn,
                    orderColumn,
                    targetId
                );

                // Guard clause incase the user has no warnings on record
                if (userWarns.length == 0) {
                    const emptyEmbed = new EmbedBuilder()
                        .setDescription(`${target.username} has no warnings`)
                        .setColor("#10b91f")
                        .setTitle(`${target.username}'s Warnings`);

                    await interaction.reply({ embeds: [emptyEmbed] });
                    return;
                }

                // Send a paginated embed
                const userWarnPages = await buildPages(
                    userWarns,
                    target,
                    interaction
                );
                await paginationHandler.paginate(interaction, userWarnPages);

                return;
            }

            // Show warning's for everyone
            const allWarns = await crudHandler.fetchWarnings(
                guildId,
                sortColumn,
                orderColumn
            );

            // Guard clause incase no warnings exist at all
            if (allWarns.length == 0) {
                const emptyEmbed = new EmbedBuilder()
                    .setDescription("Nobody has any warnings!")
                    .setColor("#10b91f")
                    .setTitle("Warnings");

                await interaction.reply({ embeds: [emptyEmbed] });
                return;
            }

            // Send a paginated embed
            const allWarnPages = await buildPages(
                allWarns,
                undefined,
                interaction
            );
            await paginationHandler.paginate(interaction, allWarnPages);
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
 * Build an array of embeds that hold a specified amount of warnings. Each element acts like a page
 *
 * @param {Object[]} warnings - An array of Warning objects
 * @param {GuildMember} targetId - An optional parameter for a guild member
 * @param {ChatInputCommandInteraction} interaction - The interaction that started the command
 * @returns {EmbedBuilder[]} An array of embeds that act as pages
 */
async function buildPages(warnings, target, interaction) {
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

        // Add first half of warning info
        currentPageInfo += `ID: \`${warnings[i].dataValues.warningId}\``;

        // Optionally add the username the warning is for if no specific user is mentioned
        if (!target) {
            let username = "Unknown user";

            const user =
                (await interaction.client.users
                    .fetch(String(warnings[i].dataValues.userId))
                    .catch(() => null)) ||
                (await interaction.client.users
                    .fetch(String(warnings[i].dataValues.userId))
                    .catch(() => null));
            if (user) {
                username = user.username;
            }

            currentPageInfo += ` | ${username}`;
        }

        // Final half of warning info
        currentPageInfo += ` | Severity: \`${
            warnings[i].dataValues.severity
        }\`\n${reason}  -  \`${generalUtils.timeAgo(date)}\`\n\n`;

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
