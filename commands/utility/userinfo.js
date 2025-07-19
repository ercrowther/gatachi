const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    // Data definition for slash command
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Returns information about the user"),
    // The function that runs when command is invoked
    async execute(interaction) {
        // Reply with the user's name and when they joined discord
        await interaction.reply(
            `This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`
        );
    },
};
