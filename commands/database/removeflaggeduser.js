const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removeflaggeduser")
        .setDescription(
            "ADMIN ONLY. Remove a user from the list of flagged users"
        )
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("The name of the user")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        try {
            const target = interaction.options.getString("username");
            const foundTarget = await crudHandler.fetchFlaggedUserByName(
                target
            );

            if (foundTarget) {
                await crudHandler.deleteFlaggedUserByName(target);

                const successEmbed = new EmbedBuilder()
                    .setColor("#10b91f")
                    .setDescription("The user has been unflagged!");
                await interaction.reply({
                    embeds: [successEmbed],
                    ephemeral: true,
                });
            } else {
                // Send a meaningful message
                const failEmbed = new EmbedBuilder()
                    .setDescription(`The user ${target} is not flagged`)
                    .setColor("#fc0303");
                await interaction.reply({
                    embeds: [failEmbed],
                    ephemeral: true,
                });
            }

            return;
        } catch (error) {
            // Send a meaningful message
            const errorEmbed = new EmbedBuilder()
                .setDescription(`**ERROR** - ${error}`)
                .setColor("#fc0303");
            await interaction.reply({
                embeds: [errorEmbed],
            });

            return;
        }
    },
};
