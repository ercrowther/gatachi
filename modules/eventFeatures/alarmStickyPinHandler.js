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

/**
 * Send the main embed message for the alarm
 *
 * @param {Channel} channel - The channel to send it in
 * @param {string} guildId - The id of the guild its for
 */
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
        .setTitle("**ACTIVE GAT ALARM!**")
        .setDescription(
            "**Your help is needed!!!** Click the blue text to jump to the game servers! \n \n Joining? Send a reaction to this message to be included in the list of participants at the end!\n(don't worry if your reaction disappears, you only need to react once!)"
        )
        .setThumbnail(process.env.ALARM_ICON_URL)
        .addFields({
            name: "Called by: ",
            value: `<@${alarmAuthor.get(guildId)}>`,
        })
        .setTimestamp()
        .setURL(process.env.ALARM_GAME_URL)
        .setFooter({
            text: "Conclude when the gathunt is over, not handled",
        });

    // Send the message and additionally update the latest message id and alarm channel id
    const sentMessage = await channel.send({
        embeds: [message],
        components: [row],
        withResponse: true,
    });

    // Make a 'conclude' button and keep it alive
    createCollector(sentMessage);

    sentMessage.react("🔔");

    // Save to database
    await crudHandler.updateAlarmMessageID(guildId, sentMessage.id);
    await crudHandler.updateAlarmChannelID(guildId, channel.id);
}

/**
 * Create a conclude button for a given message and keep it alive indefinitely until the message
 * is deleted or the alarm is concluded
 *
 * @param {Message} message - The message to make the conclude button for
 */
async function createCollector(message) {
    const guildId = message.guild.id;
    // Timeout for button
    const buttonTimeout = 900000;

    const collector = message.createMessageComponentCollector({
        time: buttonTimeout,
    });

    collector.on("collect", async (interaction) => {
        try {
            // Return all values to default - alarm is over
            resetStatesAndValuesToDefault(guildId).catch((error2) => {
                console.log(`❌ ERROR: ${error2}`);
            });

            // Disable the conclude button
            const disabledRow = new ActionRowBuilder().setComponents(
                new ButtonBuilder()
                    .setCustomId("conclude")
                    .setLabel("Conclude")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
            );

            // Updated embed to show alarm conclusion
            const concludedEmbed = EmbedBuilder.from(message)
                .setColor("#7b7b7b")
                .setThumbnail(process.env.ALARM_CONCLUDED_ICON_URL)
                .setTitle("GATHUNT OVER")
                .setDescription(
                    "The alarm is concluded, thank you to everyone who came and helped!!!"
                )
                .setFooter({
                    text: " ",
                })
                .addFields({
                    name: "Called by: ",
                    value: `<@${alarmAuthor.get(guildId)}>`,
                });

            await interaction.update({
                embeds: [concludedEmbed],
                components: [disabledRow],
            });
        } catch (error) {
            console.log(`❌ ERROR: ${error}`);
        }
    });

    collector.on("end", async () => {
        try {
            // Base case
            const isAlarmActive = await crudHandler.fetchAlarmStickyState(
                guildId
            );
            if (!isAlarmActive) {
                return;
            }

            // Re-add the button and re-create collector
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("conclude")
                    .setLabel("Conclude")
                    .setStyle(ButtonStyle.Primary)
            );

            await message.edit({ components: [row] });
            createCollector(message);
        } catch (error) {
            // It is common for the message to not be found due to the nature of the sending
            // If not found, this can pretty much be ignored
            if (error.code === 10008) {
                console.warn(
                    `⚠️ WARNING: Message with ID ${message.id} not found – already deleted`
                );
            } else {
                console.log(`❌ ERROR: ${error}`);
            }
        }
    });
}

/**
 * Remove the most recent alarm message
 *
 * @param {Channel} channel - The channel where the message is
 * @param {string} guildId - The guild the message is in
 */
async function removePreviousMessage(channel, guildId) {
    const messageId = await crudHandler.fetchAlarmLatestMessageID(guildId);

    // If message is found, try to delete the message
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

/**
 * Return the alarm values to their original defaults. Use this function when the alarm is
 * concluded
 *
 * @param {string} guildId - The guild id for the alarm
 */
async function resetStatesAndValuesToDefault(guildId) {
    // Reset all alarm values to defaults
    await Promise.all([
        crudHandler.updateAlarmMessageID(guildId, null),
        crudHandler.updateAlarmChannelID(guildId, null),
        crudHandler.updateAlarmStickyStatus(guildId, false),
    ]);
}

module.exports = { handleStickyPin };
