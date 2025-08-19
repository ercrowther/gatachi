const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const robloxHandler = require("../../modules/robloxHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("joinme")
        .setDescription(
            "Send a link to your roblox account so people can join quickly"
        ),
    async execute(interaction) {},
};

/**
 * Retrieve the ROBLOX username from a guild member's nickname
 *
 * @param {string} nickname - The discord nickname of a guild member
 * @returns {string|null} A string containing the ROBLOX username of the member, otherwise null
 */
function extractUsername(nickname) {
    const match = nickname.match(/\(([^)]+)\)$/);
    return match ? match[1] : null;
}

/**
 * Retrieve the preferred name of a guild member's nickname. Useful to fall back on if
 * the ROBLOX username doesn't exist
 *
 * @param {string} nickname - The discord nickname of a guild membe
 * @returns {string|null} A string containing the preferred name of the member, otherwise null
 */
function extractNick(nickname) {
    const match = nickname.match(/^(.*?)\s*\(/);
    return match ? match[1].trim() : null;
}
