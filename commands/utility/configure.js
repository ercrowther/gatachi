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
                .setName("gat alarm role id")
                .setDescription("The role id of the GAT ALARM role")
        )
        .addStringOption((option) =>
            option
                .setName("game server role id")
                .setDescription("The role id of the GAME SERVER ACCESS role")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const guildId = interaction.guildId;

        // Get values from options
        const alarmRoleId =
            interaction.options.getString("gat alarm role id") ?? null;
        const gameServerRoleId =
            interaction.options.getString("game server role id") ?? null;

        console.log(alarmRoleId);
        console.log(gameServerRoleId);

        // Get the updated rows for the alarm role id
        const updatedRows = crudHandler.updateAlarmRoleID(guildId, alarmRoleId);
        console.log(updatedRows);

        await interaction.reply("Completed");
    },
};
