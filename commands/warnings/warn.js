const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("ADMIN ONLY. Give out a warning to a member")
        .addMentionableOption((option) =>
            option
                .setName("user")
                .setDescription("The member to warn")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Optional - The reason for the warning")
        )
        .addIntegerOption((option) =>
            option
                .setName("severity")
                .setDescription(
                    "Optional - How severe the warning is between 1-5"
                )
                .setMinValue(1)
                .setMaxValue(5)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        console.log(interaction.guildId);
    },
};
