// Require Sequelize
const Sequelize = require("sequelize");
const Victory = require("../database/models/victory");
const VictoryMention = require("../database/models/victoryMention");

// Create a new sequelize instance to define connection information
const sequelize = new Sequelize("database", "user", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: "database.sqlite",
});

// Associations
Victory.hasMany(VictoryMention, {
    foreignKey: "victoryId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
VictoryMention.belongsTo(Victory, { foreignKey: "victoryId" });

module.exports = sequelize;
