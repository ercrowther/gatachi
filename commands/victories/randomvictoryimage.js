const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("randomvictoryimage")
        .setDescription("Get a screenshot from a random victory"),
    async execute(interaction) {
        // Get all victories with images
        const victories = await crudHandler.fetchVictoriesWithImages();

        // Safeguard if no victories with images are found
        if (victories.length === 0) {
            const noneEmbed = new EmbedBuilder()
                .setColor("#10b91f")
                .setDescription("No victory images could be found...");

            return interaction.reply({
                embeds: [noneEmbed],
                ephemeral: true,
            });
        }

        // Pick a random victory
        const randomVictory =
            victories[Math.floor(Math.random() * victories.length)];

        const imageEmbed = new EmbedBuilder()
            .setColor("#10b91f")
            .setImage(randomVictory.dataValues.imageUrl)
            .setTimestamp();

        return interaction.reply({
            embeds: [imageEmbed],
        });
    },
};
