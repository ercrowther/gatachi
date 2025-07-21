const { Events } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        // Try and get the command from the client commands collection by it's interaction name
        const command = interaction.client.commands.get(
            interaction.commandName
        );

        // If the command is not within the command property
        if (!command) {
            console.error(
                `❌ ERROR: No command matching ${interaction.commandName} was found.`
            );
            return;
        }

        // Call the command's execute function and pass it the interaction
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`❌ ERROR: ${error}`);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content:
                        "❌ ERROR: There was an unknown error while executing this command!",
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await interaction.reply({
                    content:
                        "❌ ERROR: There was an unknown error while executing this command!",
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    },
};
