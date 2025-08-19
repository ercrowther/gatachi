const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const robloxHandler = require("../../modules/robloxHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("joinme")
        .setDescription(
            "Send a link to your roblox account so people can join quickly"
        ),
    async execute(interaction) {},
};
