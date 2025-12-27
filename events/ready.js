const { Events, ActivityType } = require("discord.js");
// Require database models
const ServerConfigModel = require("../modules/database/models/serverConfig");
const FlaggedUserModel = require("../modules/database/models/flaggedUser");
const WarningModel = require("../modules/database/models/warning");
const crudHandler = require("../modules/database/crudHandler");
const Victories = require("../modules/database/models/victories");
const VictoryMentions = require("../modules/database/models/victoryMentions");
// eslint-disable-next-line no-unused-vars
const modelsIndex = require("../modules/database/models/index");

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        ServerConfigModel.sync();
        FlaggedUserModel.sync();
        WarningModel.sync();
        Victories.sync();
        VictoryMentions.sync();

        try {
            // Handle a case where the bot shutdown during an active sticky pin
            await crudHandler.resetAlarmStatesForAllServerConfigs();
            await crudHandler.resetAlarmMessageChannelIdsForAllServerConfigs();
            await crudHandler.resetAlarmLatestMessageIdsForAllServerConfigs();
        } catch (error) {
            console.error(`❌ ERROR: ${error}`);
        }

        console.log(`✅ Client is ready! Logged in as ${client.user.tag}`);
        client.user.setActivity("the safety of DW", {
            type: ActivityType.Watching,
        });
    },
};
