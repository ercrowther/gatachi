const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName("gameserverstatus")
        .setDescription("Get the current status of the current DW Game Server")
        .addBooleanOption((option) =>
            option
                .setName("secret")
                .setDescription(
                    "When true, the status will only be visible for you"
                )
        ),
    async execute(interaction) {
        await interaction.reply("Pong");
    },
};
