require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const roleValidator = require("../../modules/roleValidator");

// Variables
const serverip = process.env.GAME_SERVER_IP;

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName("gameserverstatus")
        .setDescription("Get the current status of the current DW Game Server")
        .addBooleanOption((option) =>
            option
                .setName("secret")
                .setDescription(
                    "When true, the status will only be visible for you"
                )
        ),
    async execute(interaction) {
        const guild = interaction.guild;
        const guildId = interaction.guildId;

        try {
            // Get the server's config from the database
            const config = await crudHandler.fetchServerConfigByGuildID(
                guildId
            );

            // Ensure a server config exists for the guild
            if (!config) {
                const replyEmbed = new EmbedBuilder()
                    .setColor("#fc0303")
                    .setDescription(
                        "The /configure command has not been ran for this server yet!"
                    );
                await interaction.reply({
                    embeds: [replyEmbed],
                    ephemeral: true,
                });

                return;
            }

            // Fetch the game server access role id from the database
            const gameRoleId = await crudHandler.fetchGameServerRoleIdByGuildID(
                guildId
            );
            // Validate that the member has the game server access role
            const { invalidIds } = roleValidator.validateRolesForMember(
                interaction.member,
                [gameRoleId]
            );
            // If the member does not have it, send a meaningful reply and return early
            if (invalidIds.length > 0) {
                const gameRole = guild.roles.cache.get(gameRoleId);

                const failEmbed = new EmbedBuilder()
                    .setColor("#fc0303")
                    .setDescription(
                        `You need the ${gameRole.name} role to run this command!`
                    );
                await interaction.reply({
                    embeds: [failEmbed],
                    ephemeral: true,
                });

                return;
            }
        } catch (error) {
            // If fails, log error to console and return a meaningful reply
            console.error(`❌ ERROR: ${error}`);
            const replyEmbed = new EmbedBuilder()
                .setColor("#fc0303")
                .setDescription("This command has failed unexpectedly.");
            await interaction.reply({
                embeds: [replyEmbed],
                ephemeral: true,
            });

            return;
        }

        const ephemeral = interaction.options.getBoolean("secret") ?? false;
        // Query mcstatus's api with the server ip and recieve its json reply
        const response = await fetch(
            "https://api.mcstatus.io/v2/status/java/" + serverip
        );
        const data = await response.json();

        // Construct a playerlist from the data
        let playerList = "";
        for (const player of data.players.list) {
            playerList += player.name_clean + ", ";
        }
        playerList = playerList.slice(0, -2);

        // Build an embed using the data recieved by mcstatus
        const replyEmbed = new EmbedBuilder()
            .setColor("#2596be")
            .setTitle(serverip)
            .setThumbnail(
                "https://cdn.discordapp.com/attachments/1156748910157647913/1396988726642741258/server-icon.png?ex=688016a3&is=687ec523&hm=6a8906bba6ed97428eacfa6041d377831ab46bda7e1cc01bb0cce075384d5ca1&"
            );
        // If the server is online, we should fill it with meaningful data. Otherwise, we don't
        if (data.online) {
            replyEmbed
                .setDescription("The server is online!")
                .addFields([
                    {
                        name:
                            "Players [" +
                            data.players.online.toString() +
                            " / " +
                            data.players.max.toString() +
                            "]",
                        value: playerList || "No players online",
                    },
                ])
                .setFooter({ text: data.motd.clean })
                .setTimestamp();
        } else {
            replyEmbed.setDescription("The server is not online!");
        }

        await interaction.reply({ embeds: [replyEmbed], ephemeral: ephemeral });
    },
};
