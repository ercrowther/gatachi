const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const robloxHandler = require("../../modules/robloxHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("joinme")
        .setDescription(
            "Send a link to your roblox account so people can join quickly"
        ),
    async execute(interaction) {
        const memberNick = interaction.member.nickname;
        const memberUser = interaction.user.username;
        let accountFound = false;
        let memberId = null;

        // Attempt to get the ROBLOX account id of the user by the second part of their nickname
        memberId = await robloxHandler
            .getIDByUsername(extractUsername(memberNick))
            .catch(() => null);

        // If username extraction failed, fallback to the preferred nickname
        if (!memberId) {
            memberId = await robloxHandler
                .getIDByUsername(extractNick(memberNick))
                .catch(() => null);
        }

        try {
            if (memberId) {
                const userIcon = await robloxHandler.getHeadshot(memberId);

                const successEmbed = new EmbedBuilder()
                    .setTitle(
                        `CLICK THIS TO GO TO ${memberUser.toUpperCase()}'S PROFILE`
                    )
                    .setURL(`https://www.roblox.com/users/${memberId}/profile`)
                    .setColor("#10b91f")
                    .setDescription(
                        `Click the blue text above to go to ${memberUser}'s ROBLOX profile`
                    )
                    .setThumbnail(userIcon);

                await interaction.reply({
                    embeds: [successEmbed],
                });

                return;
            }

            // If execution is here, the username was not extracted/found
            const failEmbed = new EmbedBuilder()
                .setDescription(
                    `Failed to find ROBLOX profile for ${interaction.user.username}`
                )
                .setColor("#10b91f");

            await interaction.reply({
                embeds: [failEmbed],
            });

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
