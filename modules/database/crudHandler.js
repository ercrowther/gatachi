const ServerConfigModel = require("../database/models/serverConfig");

/**
 * Create a new ServerConfig for a guild
 *
 * @param {string} guildId - The ID for the guild the ServerConfig is for
 * @returns {Promise<Object|null} - The ServerConfig instance created. May be null
 * @throws {Error} - Throws an error if the creation fails
 */
async function createServerConfig(guildId) {
    try {
        // Create the config
        const config = await ServerConfigModel.create({
            guild_id: guildId,
        });

        return config;
    } catch (error) {
        // Throw an error again so the caller can handle it and send an appropriate message
        throw new Error("Failed to create a ServerConfig: " + error.message);
    }
}

/**
 * Updates the alarm role id in the ServerConfig table for the guild specified in arguments
 *
 * @param {string} guildId - the ID of the guild
 * @param {string} alarmId  - the id for the alarm role
 * @returns {Promise<number>} - The result of the update operation.
 * @throws {Error} - Throws an error if the update fails
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
 * Updates the game server role id in the ServerConfig table for the guild specified in arguments
 *
 * @param {string} guildId - the ID of the guild
 * @param {string} gameId  - the id for the game server role
 * @returns {Promise<number>} - The result of the update operation.
 * @throws {Error} - Throws an error if the update fails
 */
async function updateGameServerRoleID(guildId, gameId) {
    try {
        // Update the game server role for the guild
        const config = await ServerConfigModel.update(
            {
                gameserver_role_id: gameId,
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
        throw new Error(
            "Failed to update game server role ID: " + error.message
        );
    }
}

/**
 * Update the status of alarm sticky pin for a guild
 *
 * @param {string} guildId - The ID for the guild
 * @param {boolean} state - The state for the sticky pin
 * @returns {Promise<number>} - The result of the update operation
 * @throws {Error} - Throws an error if the update fails
 */
async function updateAlarmStickyStatusByGuildID(guildId, state) {
    try {
        // Update the alarm sticky status
        const config = await ServerConfigModel.update(
            {
                alarm_sticky_state: state,
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
        throw new Error(
            "Failed to update alarm sticky status: " + error.message
        );
    }
}

/**
 * Fetch a ServerConfig instance using a specified guildId
 *
 * @param {string} guildId - The ID of the guild
 * @returns {Promise<Object|null} - The ServerConfig instance found, otherwise null
 * @throws {Error} - Throws an error if the fetch fails
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

/**
 * Fetch the alarm role id for a guild
 *
 * @param {string} guildId - The ID for the guild
 * @returns {Promise<Object|null} - The role id, otherwise null
 * @throws {Error} - Throws an error if the fetch fails
 */
async function fetchAlarmRoleIdByGuildID(guildId) {
    try {
        // Fetch the alarm role's id
        const config = await ServerConfigModel.findOne({
            where: {
                guild_id: guildId,
            },
        });

        return config.alarm_role_id;
    } catch (error) {
        // Throw an error again so the caller can handle it and send an appropriate message
        throw new Error("Failed to fetch alarm role ID: " + error.message);
    }
}

/**
 * Fetch the game server role id for a guild
 *
 * @param {string} guildId - The ID for the guild
 * @returns {Promise<Object|null} - The role id, otherwise null
 * @throws {Error} - Throws an error if the fetch fails
 */
async function fetchGameServerRoleIdByGuildID(guildId) {
    try {
        // Fetch the game server role's id
        const config = await ServerConfigModel.findOne({
            where: {
                guild_id: guildId,
            },
        });

        return config.gameserver_role_id;
    } catch (error) {
        // Throw an error again so the caller can handle it and send an appropriate message
        throw new Error(
            "Failed to fetch game server role ID: " + error.message
        );
    }
}

/**
 * Fetch the state of the alarm sticky pin using a guild ID
 *
 * @param {string} guildId - The ID for the guild
 * @returns {Promise<Object|null} - The sticky pin state, otherwise null
 * @throws {Error} - Throws an error if the fetch fails
 */
async function fetchAlarmStickyStateByGuildID(guildId) {
    try {
        // Fetch the state of the alarm sticky pin
        const config = await ServerConfigModel.findOne({
            where: {
                guild_id: guildId,
            },
        });

        return config.alarm_sticky_state;
    } catch (error) {
        // Throw an error again so the caller can handle it and send an appropriate message
        throw new Error("Failed to fetch alarm sticky state: " + error.message);
    }
}

module.exports = {
    updateAlarmRoleID,
    fetchServerConfigByGuildID,
    createServerConfig,
    updateGameServerRoleID,
    fetchAlarmRoleIdByGuildID,
    fetchGameServerRoleIdByGuildID,
    fetchAlarmStickyStateByGuildID,
    updateAlarmStickyStatusByGuildID,
};
