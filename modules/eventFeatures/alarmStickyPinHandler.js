const crudHandler = require("../database/crudHandler");

/**
 * Begin handling of a possible sticky pin for alarm. If the message does not mention the
 * alarm role, this function will do nothing
 *
 * @param {Message} message - A message that was sent
 */
async function handleStickyPin(message) {
    // Guild related variables
    const guild = message.guild;
    const guildId = guild.id;
    const client = message.client;
    // Message related variables
    const channel = client.channels.cache.get(message.channelId);
    const alarmRoleId = await crudHandler.fetchAlarmRoleId(guildId);

    try {
        // If there is an active alarm and the user isn't typing in that channel, return immediately
        const alarmChannelId = await crudHandler.fetchAlarmMessageChannelID(
            guildId
        );
        if (alarmChannelId && message.channelId != alarmChannelId) {
            return;
        }

        // Check if there is an active pin. If not, set the state to active
        const isAlarmActive = await crudHandler.fetchAlarmStickyState(guildId);
        if (!isAlarmActive) {
            // If alarm mentioned, set state to true, otherwise return early
            if (message.mentions.roles.has(alarmRoleId)) {
                await crudHandler.updateAlarmStickyStatus(guildId, true);
            } else {
                return;
            }
        }

        // If there is a past message, remove it
        if (alarmChannelId) {
            await removePreviousMessage(channel, guildId);
        }

        await sendEmbedPin(channel, guildId);
    } catch (error) {
        console.log(`❌ ERROR: ${error}`);
        resetStatesAndValuesToDefault(guildId);
    }
}

async function sendEmbedPin(channel, guildId) {
    channel.send("test message").then(async (sentMessage) => {
        await crudHandler.updateAlarmMessageID(guildId, sentMessage.id);
        await crudHandler.updateAlarmChannelID(guildId, channel.id);
    });
}

async function removePreviousMessage(channel, guildId) {
    const messageId = await crudHandler.fetchAlarmLatestMessageID(guildId);

    if (messageId) {
        // Delete the message
        const message = await channel.messages.fetch(messageId);
        message.delete();
    }
}

async function resetStatesAndValuesToDefault(guildId) {
    await crudHandler.updateAlarmMessageID(guildId, null);
    await crudHandler.updateAlarmChannelID(guildId, null);
    await crudHandler.updateAlarmStickyStatus(guildId, false);
}

module.exports = { handleStickyPin };
