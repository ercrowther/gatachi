const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

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
    async execute(interaction) {},
};
