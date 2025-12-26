require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("victorytally")
        .setDescription("Tally up some info about all victories")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription(
                    "Optional - A user to tally their victories for"
                )
        ),
    async execute(interaction) {
        const target = interaction.options.getUser("user");

        try {
            // Tally variables
            let totalRagequits = 0;
            let totalStanddowns = 0;
            let totalTerminations = 0;

            // 7-day tally variables
            let totalSevenDayVals = 0;

            // Calculate date 7 days ago
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

            // Fetch all victories (or all victories where user is mentioned)
            const victories = await crudHandler.fetchVictories(
                null,
                "date",
                "ASC",
                target ? target.id : null
            );

            // Tally up everything
            for (const victory of victories) {
                totalRagequits += victory.dataValues.ragequits;
                totalStanddowns += victory.dataValues.standdowns;
                totalTerminations += victory.dataValues.terminations;

                // Check if within last 7 days
                if (victory.dataValues.date >= sevenDaysAgoStr) {
                    totalSevenDayVals += victory.dataValues.ragequits;
                    totalSevenDayVals += victory.dataValues.standdowns;
                    totalSevenDayVals += victory.dataValues.terminations;
                }
            }

            // Generate the title for embed based on if target is provided
            let title;
            if (target) {
                title = `TOTAL GATS DESTROYED BY ${target.username.toUpperCase()}: \`${
                    totalRagequits + totalStanddowns + totalTerminations
                }\`!`;
            } else {
                title = `TOTAL GATS DESTROYED: \`${
                    totalRagequits + totalStanddowns + totalTerminations
                }\`!`;
            }

            const tallyEmbed = new EmbedBuilder()
                .setColor("#10b91f")
                .setTitle(title)
                .setThumbnail(process.env.VICTORY_ICON_URL)
                .setDescription(
                    `Total gats within 7 days: \`${totalSevenDayVals}\``
                )
                .addFields(
                    { name: "Total RQ's: ", value: `\`${totalRagequits}\`` },
                    {
                        name: "Total Standdowns: ",
                        value: `\`${totalStanddowns}\``,
                        inline: true,
                    },
                    {
                        name: "Total Terminations: ",
                        value: `\`${totalTerminations}\``,
                        inline: true,
                    }
                )
                .setTimestamp();
            // Set the footer based on if there's been a gathunt today
            const today = new Date();
            const todayStr =
                today.getFullYear() +
                "-" +
                String(today.getMonth() + 1).padStart(2, "0") +
                "-" +
                String(today.getDate()).padStart(2, "0");
            const latestVictory = victories[victories.length - 1];
            if (latestVictory && latestVictory.dataValues.date === todayStr) {
                tallyEmbed.setFooter({
                    text: "There has been a victory today",
                });
            } else {
                tallyEmbed.setFooter({
                    text: "There hasn't been a victory today",
                });
            }

            await interaction.reply({ embeds: [tallyEmbed] });
        } catch (error) {
            // Send a meaningful message
            const errorEmbed = new EmbedBuilder()
                .setDescription(`**ERROR** - ${error}`)
                .setColor("#fc0303");
            await interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true,
            });
        }
    },
};
