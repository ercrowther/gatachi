const { Events, Collection, MessageFlags } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const { cooldowns } = interaction.client;

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

        // If the interaction isn't already in the cooldown's collection, add it
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        // Incase cooldown isn't specified in the slash command
        const defaultCooldownDuration = 2;
        const cooldownAmount =
            (command.cooldown ?? defaultCooldownDuration) * 1_000;

        // If a user id is associated with the interaction (meaning it's on cooldown for someone)
        if (timestamps.has(interaction.user.id)) {
            const expirationTime =
                timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1_000);
                return interaction.reply({
                    content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }

        // Set time out to remove the interaction:userid entry
        timestamps.set(interaction.user.id, now);
        setTimeout(
            () => timestamps.delete(interaction.user.id),
            cooldownAmount
        );

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
