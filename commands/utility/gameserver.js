const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName("gameserverstatus")
        .setDescription("Get the current status of the active DW Game Server"),
    async execute(interaction) {
        await interaction.reply("Pong");
    },
};
