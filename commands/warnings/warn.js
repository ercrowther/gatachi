require("dotenv").config();
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
        .addUserOption((option) =>
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
        const guildId = interaction.guildId;
        const target = interaction.options.getUser("user").id;
        const reason = interaction.options.getString("reason");
        const severity = interaction.options.getInteger("severity") ?? 1;
        const memberName = interaction.options.getUser("user").username;

        try {
            await crudHandler.createWarning(target, guildId, reason, severity);

            const successEmbed = new EmbedBuilder()
                .setTitle(`WARNED ${memberName.toUpperCase()}`)
                .setColor("#10b91f")
                .addFields(
                    {
                        name: "Reason",
                        value: reason ?? "None provided",
                        inline: true,
                    },
                    {
                        name: "Severity",
                        value: severity?.toString(),
                        inline: true,
                    }
                )
                .setTimestamp();

            await interaction.reply({
                embeds: [successEmbed],
            });
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
