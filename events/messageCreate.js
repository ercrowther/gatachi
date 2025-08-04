const { Events } = require("discord.js");
const StickyPinHandler = require("../modules/eventFeatures/alarmStickyPinHandler");

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        StickyPinHandler.handleStickyPin(message);
    },
};
