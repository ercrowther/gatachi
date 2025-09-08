const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const crudHandler = require("../../modules/database/crudHandler");
const paginationHandler = require("../../modules/paginationHandler");

const namesPerPage = 15;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("groupdiff")
        .setDescription(
            "ADMIN ONLY. List all roblox accounts in the discord but not in the ROBLOX group"
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const guild = interaction.guild;
        // ROBLOX account names for the group difference
        const accountGroupDiff = [];
        // ROBLOX account names that are actually in the group
        const groupAccountNames = [];

        try {
            // Get all 
        }

        guild.members
            .fetch()
            .then((members) => {
                members.forEach((member) => {
                    console.log(`Member: ${member.user.tag}`);
                });
            })
            .catch(console.error);
    },
};
