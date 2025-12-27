const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("victorytutorial")
        .setDescription("ADMIN ONLY. Learn about how to use the victory system")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("Victories and You")
            .setDescription(
                "You have *three commands* to manage saved victories: **/addvictory**, **/editvictory**, and **/removevictory**. After making additions or changes, you can use **/victory** and pass it the ID of the victory you want to view. \n\n**/addvictory**\nThe most important parameter for this command is the 'date' parameter. It MUST be in the format of 'yyyy-mm-dd'. If the date was 2025, December 25th, then the date for the victory would be input as 2025-12-25. Then, you will input ragequits, standdowns, and terminations - you can omit any of these to have it be inputted as zero. There is also an optional parameter for inputting an image url for when DW screenshots are taken. Finally, another important part is adding mentions to the victory. After sending the command, you will be prompted to reply to the bot's message with pings of people in the discord server. Make sure it's a *reply*, don't just send it on it's own. **IMPORTANT!!** you are NOT mentioned in the victory by default: don't forget to ping yourself if you were there!\n\n**/editvictory**\nVirtually the same as /addvictory, but you pass it the ID of the victory you want to edit information for. You can omit any parameter to *leave it as the default info*. If the victory has 10 ragequits, and you don't send the command with any number for ragequits, it will *stay* at 10 ragequits. This command also has a parameter called editmentions. If it's true, you'll be prompted to reply with mentions just like /addvictory.\n\n**/removevictory**\nEasy command - pass it the ID of a victory, and it will be removed. ID's are shown with **/victory** or **/victories**"
            )
            .setColor("#10b91f")
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
