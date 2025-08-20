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
        withRespone: true,
    });

    const collector = currentPage.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: msTimeout,
    });

    collector.on("collect", async (i) => {
        if (i.customId == "prev") {
            // Only decrease index to 0, not negatives
            if (index > 0) {
                index -= 1;
            }

            // If index is now zero, disable the prevButton
            if (index == 0) {
                prevButton.setDisabled(true);
            } else {
                prevButton.setDisabled(false);
            }
        } else if (i.customId == "next") {
            // Only increase to the length of the pages array
            if (index < pages.length - 1) {
                index += 1;
            }

            if (index == pages.length - 1) {
                nextButton.setDisabled(true);
            } else {
                nextButton.setDisabled(false);
            }
        }

        await i.update({
            embeds: [pages[index]],
            components: [row],
        });
    });

    collector.on("end", () => {
        row.components.forEach((btn) => btn.setDisabled(true));
        currentPage.edit({ components: [row] });
    });
}

module.exports = { paginate };
