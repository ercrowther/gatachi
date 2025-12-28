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

        // Warm the guildmembers cache
        for (const guild of client.guilds.cache.values()) {
            // Dont do this on a large guild its super slow
            if (guild.memberCount > 2000) {
                console.warn(
                    `⚠️ Skipping member fetch for ${guild.name}. (${guild.memberCount} members!)`
                );
                continue;
            }

            try {
                console.log(`🔄 Warming member cache for ${guild.name}...`);
                await guild.members.fetch();
                console.log(
                    `✅ Cached ${guild.members.cache.size} members for ${guild.name}`
                );
            } catch (err) {
                console.error(
                    `❌ Failed to fetch members for ${guild.name}`,
                    err
                );
            }
        }
    },
};
