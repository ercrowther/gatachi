require("dotenv").config();
const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

const severityMax = 8;
const warningMax = 3;

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

            // Get all warnings for the user
            const userWarnings = await crudHandler.fetchWarnings(
                guildId,
                undefined,
                undefined,
                target
            );

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

            // Build a follow up message if user has exceeded the max for warnings, severity or both
            let followUpMessage = "";
            const totalSeverity = getTotalSeverity(userWarnings);
            if (totalSeverity >= severityMax) {
                followUpMessage += `${memberName} has a high severity total: \`${totalSeverity}\`\n`;
            }
            if (userWarnings.length >= warningMax) {
                followUpMessage += `${memberName} has many warnings! They now have: \`${userWarnings.length}\``;
            }

            // If there is a follow up to give out, send one
            if (followUpMessage) {
                const followUpEmbed = new EmbedBuilder()
                    .setTitle("Attention!")
                    .setColor("#ffac32")
                    .setDescription(followUpMessage);

                await interaction.followUp({
                    embeds: [followUpEmbed],
                    ephemeral: true,
                });
            }
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

/**
 * Given an array of Warnings, return the severity total from all of them
 *
 * @param {Object[]} warns - An array of Warning objects
 * @returns {number} The total severity from all of them
 */
function getTotalSeverity(warns) {
    let total = 0;

    for (const warn of warns) {
        total += warn.dataValues.severity;
    }

    return total;
}
