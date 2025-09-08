const Victory = require("./victory");
const VictoryMention = require("./victoryMention");

// Associations
Victory.hasMany(VictoryMention, {
    foreignKey: "victoryId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
VictoryMention.belongsTo(Victory, { foreignKey: "victoryId" });
