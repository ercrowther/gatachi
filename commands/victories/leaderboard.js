require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const paginationHandler = require("../../modules/paginationHandler");

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
        ),
    async execute(interaction) {
        // Parse options
        const range = interaction.options.getString("range") ?? "range_all";
        const boardType =
            interaction.options.getString("board-type") ?? "type_gats";
    },
};
