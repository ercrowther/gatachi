const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("victorytally")
        .setDescription("Tally up some info about all victories"),
    async execute(interaction) {},
};
