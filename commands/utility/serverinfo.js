const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    // Data definition for slash command
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Returns information about the server"),
    // The function that runs when command is invoked
    async execute(interaction) {
        // Reply with server name and member count
        await interaction.reply(
            `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
        );
    },
};
