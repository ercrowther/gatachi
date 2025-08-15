const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const robloxHandler = require("../../modules/robloxHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add_flagged_user")
        .setDescription(
            "ADMIN ONLY. Add a 'flagged user' to be detected during a scan"
        )
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("A roblox username")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const username = interaction.options.getString("username");
        let userId = 0;

        // Guard clause for making sure the username links to a valid roblox profile
        try {
            userId = await robloxHandler.getIDByUsername(username);
        } catch {
            // Send a meaningful message
            const badUserEmbed = new EmbedBuilder()
                .setDescription("**This username does not exist on ROBLOX!")
                .setColor("#fc0303");
            await interaction.reply({
                embeds: [badUserEmbed],
                ephemeral: true,
            });

            return;
        }

        try {
            await crudHandler.createFlaggedUser(userId, username);

            const successEmbed = new EmbedBuilder()
                .setColor("#10b91f")
                .setDescription("Successfully added account to list of flagged users!");
            await interaction.reply({
                embeds: [replyEmbed],
                ephemeral: true,
            });

            await interaction.reply({
                embeds: [successEmbed],
                ephemeral: true,
            });
        } catch (error) {
            // Send a meaningful message
            const errorEmbed = new EmbedBuilder()
                .setDescription(`**FATAL ERROR** - ${error}`)
                .setColor("#fc0303");
            await interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true,
            });

            return;
        }
    },
};
