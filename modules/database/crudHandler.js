const { Op } = require("sequelize");
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
async function updateAlarmStickyStatus(guildId, state) {
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
 * Update the most recent message id from the alarm sticky pin
 *
 * @param {string} guildId - The ID for the guild
 * @param {string} messageId - The message id
 * @returns {Promise<number>} - The result of the update operation
 * @throws {Error} - Throws an error if the update fails
 */
async function updateAlarmMessageID(guildId, messageId) {
    try {
        // Update the alarm message id
        const config = await ServerConfigModel.update(
            {
                alarm_latest_message_id: messageId,
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
            "Failed to update latest alarm message id: " + error.message
        );
    }
}

/**
 * Update the channel id where the latest message from the alarm pin is in
 *
 * @param {string} guildId - The ID for the guild
 * @param {string} channelId - The channel id
 * @returns {Promise<number>} - The result of the update operation
 * @throws {Error} - Throws an error if the update fails
 */
async function updateAlarmChannelID(guildId, channelId) {
    try {
        // Update the alarm channel id
        const config = await ServerConfigModel.update(
            {
                alarm_message_channel_id: channelId,
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
        throw new Error("Failed to update alarm channel id: " + error.message);
    }
}

/**
 * Change the alarm states back to false for every server config. Useful to use when the bot is rebooting
 *
 * @returns {Promise<number>} - The result of the update operation
 * @throws {Error} - Throws an error if the update fails
 */
async function resetAlarmStatesForAllServerConfigs() {
    try {
        // Reset alarm state for all configs
        const config = await ServerConfigModel.update(
            {
                alarm_sticky_state: false,
            },
            {
                where: {
                    alarm_sticky_state: true,
                },
            }
        );

        return config;
    } catch (error) {
        // Throw an error again so the caller can handle it and send an appropriate message
        throw new Error("Failed to reset all alarm states: " + error.message);
    }
}

/**
 * Reset the alarm_latest_message_id field to null for every server config.
 * Useful to use when the bot is rebooting.
 *
 * @returns {Promise<number>} - The result of the update operation
 * @throws {Error} - Throws an error if the update fails
 */
async function resetAlarmLatestMessageIdsForAllServerConfigs() {
    try {
        const result = await ServerConfigModel.update(
            {
                alarm_latest_message_id: null,
            },
            {
                where: {
                    alarm_latest_message_id: {
                        [Op.ne]: null,
                    },
                },
            }
        );

        return result;
    } catch (error) {
        throw new Error(
            "Failed to reset all alarm_latest_message_id fields: " +
                error.message
        );
    }
}

/**
 * Reset the alarm_message_channel_id field to null for every server config.
 * Useful to use when the bot is rebooting.
 *
 * @returns {Promise<number>} - The result of the update operation
 * @throws {Error} - Throws an error if the update fails
 */
async function resetAlarmMessageChannelIdsForAllServerConfigs() {
    try {
        const result = await ServerConfigModel.update(
            {
                alarm_message_channel_id: null,
            },
            {
                where: {
                    alarm_message_channel_id: {
                        [Op.ne]: null,
                    },
                },
            }
        );

        return result;
    } catch (error) {
        throw new Error(
            "Failed to reset all alarm_message_channel_id fields: " +
                error.message
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
async function fetchServerConfig(guildId) {
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
async function fetchAlarmRoleId(guildId) {
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
async function fetchGameServerRoleId(guildId) {
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
async function fetchAlarmStickyState(guildId) {
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

/**
 * Fetch the ID of the most recent sticky pinned alarm message for a guild
 *
 * @param {string} guildId - The ID for the guild
 * @returns {Promise<Object|null} - The id of the message, otherwise null
 * @throws {Error} - Throws an error if the fetch fails
 */
async function fetchAlarmLatestMessageID(guildId) {
    try {
        // Fetch the id of the most recent message
        const config = await ServerConfigModel.findOne({
            where: {
                guild_id: guildId,
            },
        });

        return config.alarm_latest_message_id;
    } catch (error) {
        // Throw an error again so the caller can handle it and send an appropriate message
        throw new Error(
            "Failed to fetch latest alarm message: " + error.message
        );
    }
}

/**
 * Fetch the ID of the channel where the latest alarm message was sent
 *
 * @param {string} guildId - The ID for the guild
 * @returns {Promise<Object|null} - The id of the channel, otherwise null
 * @throws {Error} - Throws an error if the fetch fails
 */
async function fetchAlarmMessageChannelID(guildId) {
    try {
        // Fetch the id of the channel for the most recent alarm message
        const config = await ServerConfigModel.findOne({
            where: {
                guild_id: guildId,
            },
        });

        return config.alarm_message_channel_id;
    } catch (error) {
        // Throw an error again so the caller can handle it and send an appropriate message
        throw new Error("Failed to fetch alarm channel: " + error.message);
    }
}

module.exports = {
    updateAlarmRoleID,
    fetchServerConfig,
    createServerConfig,
    updateGameServerRoleID,
    fetchAlarmRoleId,
    fetchGameServerRoleId,
    fetchAlarmStickyState,
    updateAlarmStickyStatus,
    fetchAlarmLatestMessageID,
    fetchAlarmMessageChannelID,
    updateAlarmMessageID,
    updateAlarmChannelID,
    resetAlarmStatesForAllServerConfigs,
    resetAlarmLatestMessageIdsForAllServerConfigs,
    resetAlarmMessageChannelIdsForAllServerConfigs,
};
