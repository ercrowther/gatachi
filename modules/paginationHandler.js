const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const msTimeout = 180000;

/**
 * Creates a paginated embed message with buttons to switch between pages
 * Simply call the function and let it run independently. Once collectors are complete, it is cleaned up
 *
 * @param {ChatInputCommandInteraction} interaction - The interaction that triggered pagination
 * @param {EmbedBuilder[]} pages - An array of EmbedBuilder objects that act as pages
 * @returns {Promise<void>} Resolves once paginator is created
 */
async function paginate(interaction, pages) {
    let index = 0;

    // Buttons for switching pages
    const prevButton = new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("◀️")
        .setDisabled(true)
        .setStyle(ButtonStyle.Primary);
    const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setLabel("▶️")
        .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(prevButton, nextButton);

    // Send the current page using the current index within the array of embed pages
    const currentPage = await interaction.reply({
        embeds: [pages[index]],
        components: [row],
        withResponse: true,
    });

    const collector =
        currentPage.resource.message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: msTimeout,
        });

    collector.on("collect", async (i) => {
        if (i.customId == "prev") {
            // Only decrease index to 0, not negatives
            if (index > 0) {
                index -= 1;
            }
        } else if (i.customId == "next") {
            // Only increase to the length of the pages array
            if (index < pages.length - 1) {
                index += 1;
            }
        }

        prevButton.setDisabled(index === 0);
        nextButton.setDisabled(index === pages.length - 1);

        try {
            await i.update({ embeds: [pages[index]], components: [row] });
        } catch (err) {
            // Rethrow errors that arent expected. Code 10008 is expected and not a concern
            if (err.code !== 10008) throw err;
        }
    });

    collector.on("end", async () => {
        row.components.forEach((btn) => btn.setDisabled(true));

        try {
            await currentPage.resource.message.edit({ components: [row] });
        } catch (err) {
            // Rethrow errors that arent expected. Code 10008 is expected and not a concern
            if (err.code !== 10008) throw err;
        }
    });
}

module.exports = { paginate };
