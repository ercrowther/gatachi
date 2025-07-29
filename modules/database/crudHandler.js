const ServerConfigModel = require("../database/models/serverConfig");

/**
 * Updates the alarm role id in the ServerConfig table for the guild specified in arguments
 *
 * @param {string} guildId - the ID of the guild
 * @param {string} alarmId  - the id for the alarm role
 * @returns {Promise<number>} The result of the update operation.
 * @throws {Error} Throws an error if the update fails
 */
async function updateAlarmRoleID(guildId, alarmId) {
    try {
        // Update the alarm role for the guild
        const config = await ServerConfigModel.update(
            {
                alarm_role_id: alarmId,
            },
            {
                where: {
                    guild_id: guildId,
                },
            }
        );

        return config;
    } catch (error) {
        // Throw an error again so the caller can handle it and send an appropriate message
        throw new Error("Failed to update alarm role ID: " + error.message);
    }
}

/**
 * Fetch a ServerConfig instance using a specified guildId
 *
 * @param {string} guildId - The ID of the guild
 * @returns {Promise<Object|null} The ServerConfig instance found, otherwise null
 * @throws {Error} Throws an error if the fetch fails
 */
async function fetchServerConfigByGuildID(guildId) {
    try {
        // Select the config by guild id
        const config = await ServerConfigModel.findOne({
            where: {
                guild_id: guildId,
            },
        });

        return config;
    } catch (error) {
        // Throw an error again so the caller can handle it and send an appropriate message
        throw new Error("Failed to fetch config by guild ID: " + error.message);
    }
}

module.exports = {
    updateAlarmRoleID,
    fetchServerConfigByGuildID,
};
