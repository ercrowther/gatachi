const { Events } = require("discord.js");
const StickyPinHandler = require("../modules/eventFeatures/alarmStickyPinHandler");

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        // Sticky pin feature
        if (!message.author.bot) {
            StickyPinHandler.handleStickyPin(message);
        }
    },
};
