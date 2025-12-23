const Victories = require("./victories");
const VictoryMentions = require("./victoryMentions");

// Associations
Victories.hasMany(VictoryMentions, {
    foreignKey: "victoryId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
VictoryMentions.belongsTo(Victories, { foreignKey: "victoryId" });
