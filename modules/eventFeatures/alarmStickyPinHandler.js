require("dotenv").config();
const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const crudHandler = require("../database/crudHandler");

// A set of guild id's. If a guild id is in here, that guild's alarm repin is currently running
// handleStickyPin can only run on a guild when it's id isnt here
const pinLock = new Set();
// Keep track of who called an alarm per guild
const alarmAuthor = new Map();

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

    // If guildId is present in the pinLock, it means this function is already running. Exit early
    if (pinLock.has(guildId)) {
        return;
    }

    // Lock using guild id
    pinLock.add(guildId);

    try {
        // Batching database queries for necessary information
        const [alarmRoleId, alarmChannelId, isAlarmActive] = await Promise.all([
            crudHandler.fetchAlarmRoleId(guildId),
            crudHandler.fetchAlarmMessageChannelID(guildId),
            crudHandler.fetchAlarmStickyState(guildId),
        ]);

        // If there is an active alarm and the user isn't typing in that channel, return immediately
        if (alarmChannelId && message.channelId != alarmChannelId) {
            return;
        }

        // Check if there is an active pin. If not, set the state to active
        if (!isAlarmActive) {
            // If alarm mentioned, set state to true, otherwise return early
            if (message.mentions.roles.has(alarmRoleId)) {
                await crudHandler.updateAlarmStickyStatus(guildId, true);
                alarmAuthor.set(guildId, message.author.id);
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

        await resetStatesAndValuesToDefault(guildId).catch((error2) => {
            console.log(`❌ ERROR: ${error2}`);
        });
    } finally {
        // Unlock the guild
        pinLock.delete(guildId);
    }
}

async function sendEmbedPin(channel, guildId) {
    // Action row and button for the embed
    const concludeButton = new ButtonBuilder()
        .setCustomId("conclude")
        .setLabel("Conclude")
        .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(concludeButton);

    // Build the message
    const message = new EmbedBuilder()
        .setColor("#ffac32")
        .setTitle("ACTIVE GAT ALARM!")
        .setDescription(
            "Your help is needed!!! Click the blue text to jump to the game servers! \n \n Joining? Send a reaction to this message to be included in the list of participants at the end! (don't worry if your reaction disappears, you only need to react once!)"
        )
        .setThumbnail(process.env.ALARM_ICON_URL)
        .addFields({
            name: "Called by: ",
            value: `<@${alarmAuthor.get(guildId)}>`,
        })
        .setTimestamp()
        .setURL(process.env.ALARM_GAME_URL)
        .setFooter({
            text: "Hit conclude to end the alarm",
        });

    // Send the message and additionally update the latest message id and alarm channel id
    const sentMessage = await channel.send({
        embeds: [message],
        components: [row],
    });
    sentMessage.react("🔔");
    await crudHandler.updateAlarmMessageID(guildId, sentMessage.id);
    await crudHandler.updateAlarmChannelID(guildId, channel.id);
}

async function removePreviousMessage(channel, guildId) {
    const messageId = await crudHandler.fetchAlarmLatestMessageID(guildId);

    if (messageId) {
        try {
            const message = await channel.messages.fetch(messageId);
            await message.delete();
        } catch (error) {
            // If delete fails, handle and rethrow if its code 10008
            if (error.code === 10008) {
                console.warn(
                    `⚠️ WARNING: Message with ID ${messageId} not found – already deleted`
                );
            } else {
                throw error;
            }
        }
    }
}

async function resetStatesAndValuesToDefault(guildId) {
    // Reset all alarm values to defaults
    await Promise.all([
        crudHandler.updateAlarmMessageID(guildId, null),
        crudHandler.updateAlarmChannelID(guildId, null),
        crudHandler.updateAlarmStickyStatus(guildId, false),
    ]);
}

module.exports = { handleStickyPin };
