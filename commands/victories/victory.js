require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const generalUtils = require("../../modules/generalUtils");
const VictoryMentionsModel = require("../../modules/database/models/victoryMentions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("victory")
        .setDescription("View information for a specific victory")
        .addIntegerOption((option) =>
            option
                .setName("id")
                .setDescription("The ID for the victory")
                .setRequired(true)
        ),
    async execute(interaction) {
        const id = interaction.options.getInteger("id");

        try {
            // Attempt to get the specified victory
            const fetchedVictories = await crudHandler.fetchVictories(id);

            // Stop early if nothing was found
            if (fetchedVictories.length == 0) {
                // Send a meaningful message
                const errorEmbed = new EmbedBuilder()
                    .setDescription(`There is no victory with ID ${id}`)
                    .setColor("#fc0303");
                await interaction.reply({
                    embeds: [errorEmbed],
                });

                return;
            }

            // Cache victory data
            const victory = fetchedVictories[0].dataValues;
            const ragequits = victory.ragequits;
            const standdowns = victory.standdowns;
            const terminations = victory.terminations;
            const date = victory.date;
            const dateObj = new Date(date);
            const imageUrl = victory.imageUrl;

            // Fetch mentions for the victory
            const mentions = await VictoryMentionsModel.findAll({
                where: { victoryId: victory.id },
            });

            // Create mentions list
            let mentionsList = "";
            for (const mention of mentions) {
                mentionsList += `<@${mention.userId}> `;
            }

            const successEmbed = new EmbedBuilder()
                .setTitle(
                    `VICTORY ${id}  -  TOTAL GATS: \`${
                        ragequits + standdowns + terminations
                    }\``
                )
                .setDescription(
                    `This victory happened on \`${date}, ${generalUtils.timeAgo(
                        dateObj
                    )}\`. There were...\n\`${ragequits}\` ragequits\n\`${standdowns}\` standdowns\nand \`${terminations}\` terminations! ${
                        mentionsList
                            ? `\n\nThe people who helped were: ${mentionsList}`
                            : ""
                    }`
                )
                .setColor("#10b91f")
                .setThumbnail(process.env.VICTORY_ICON_URL)
                .setImage(imageUrl);

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
