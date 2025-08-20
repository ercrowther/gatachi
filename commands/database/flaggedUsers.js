const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const paginationHandler = require("../../modules/paginationHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("flaggedusers")
        .setDescription(
            "Get a list of all flagged users that are checked during the scan command"
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // create 3 sample pages
        const pages = [
            new EmbedBuilder()
                .setTitle("Page 1")
                .setDescription("This is the first page")
                .setColor("Blue"),
            new EmbedBuilder()
                .setTitle("Page 2")
                .setDescription("This is the second page")
                .setColor("Green"),
            new EmbedBuilder()
                .setTitle("Page 3")
                .setDescription("This is the third page")
                .setColor("Red"),
        ];

        await paginationHandler.paginate(interaction, pages);
    },
};
