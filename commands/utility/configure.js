const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("configure")
        .setDescription(
            "ADMIN ONLY. Configure the bot settings for the server."
        )
        .setStringOption((option) =>
            option
                .setName("gat alarm role id")
                .setDescription("The role id of the GAT ALARM role")
        )
        .setStringOption((option) =>
            option
                .setName("game server role id")
                .setDescription("The role id of the GAME SERVER ACCESS role")
        ),
    async execute(interaction) {
        // . . .
    },
};
