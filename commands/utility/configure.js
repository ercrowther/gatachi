const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("configure")
        .setDescription(
            "ADMIN ONLY. Configure the bot settings for the server."
        )
        .addStringOption((option) =>
            option
                .setName("gat_alarm_role_id")
                .setDescription("The role id of the GAT ALARM role")
        )
        .addStringOption((option) =>
            option
                .setName("game_server_role_id")
                .setDescription("The role id of the GAME SERVER ACCESS role")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const guildId = interaction.guildId;

        // Get values from options
        const alarmRoleId =
            interaction.options.getString("gat_alarm_role_id") ?? null;
        const gameServerRoleId =
            interaction.options.getString("game_server_role_id") ?? null;

        try {
            // Query to see if an instance of ServerConfig exists for the current guild
            const configInstance = await crudHandler.fetchServerConfigByGuildID(
                guildId
            );
            if (configInstance == null) {
                // . . .
            }

            // Get the updated rows for the alarm role id
            const alarmRowsUpdated = await crudHandler.updateAlarmRoleID(
                guildId,
                alarmRoleId
            );
        } catch (error) {
            console.log(error);
        }

        await interaction.reply("Completed");
    },
};
