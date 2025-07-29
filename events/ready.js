const { Events } = require("discord.js");
// Require database models
const ServerConfigModel = require("../modules/database/models/serverConfig");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        ServerConfigModel.sync({});
        console.log(`✅ Client is ready! Logged in as ${client.user.tag}`);
    },
};
