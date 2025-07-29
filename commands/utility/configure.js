const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
} = require("discord.js");
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
            interaction.options.getString("gat_alarm_role_id");
        const gameServerRoleId =
            interaction.options.getString("game_server_role_id");

        try {
            // Query to see if an instance of ServerConfig exists for the current guild
            const configInstance = await crudHandler.fetchServerConfigByGuildID(
                guildId
            );
            if (configInstance == null) {
                // If one does not exist yet, create one before continuing.
                await crudHandler.createServerConfig(guildId);
                console.error(
                    `➕ Added new ServerConfig for guild ID ${guildId}`
                );
            }

            // If the alarm role id was supplied, update the alarm role id for the guild
            if (alarmRoleId != null) {
                await crudHandler.updateAlarmRoleID(guildId, alarmRoleId);
            }
        } catch (error) {
            // If fails, log error to console and return a meaningful reply
            console.error(`❌ ERROR: ${error}`);
            const replyEmbed = new EmbedBuilder()
                .setColor("#fc0303")
                .setTitle("This command has failed unexpectedly.");
            await interaction.reply({
                embeds: [replyEmbed],
                ephemeral: true,
            });

            return;
        }

        await interaction.reply("Completed");
    },
};
