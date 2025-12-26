const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

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
        
    },
};
