const { Events } = require("discord.js");
// Require database models
const ServerConfigModel = require("../modules/database/models/serverConfig");
const crudHandler = require("../modules/database/crudHandler");

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        ServerConfigModel.sync();

        // Handle a case where the bot shutdown during an active sticky pin
        await crudHandler.resetAlarmStatesForAllServerConfigs();

        console.log(`✅ Client is ready! Logged in as ${client.user.tag}`);
    },
};
