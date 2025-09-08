const { Sequelize } = require("sequelize");
const sequelize = require("../db");

/**
 * id: Normal primary key to uniquely identify each victory mention
 * victoryId: A foreign key to a victory id (not a victory's victoryId, but their primary key)
 * userId: The discord user id of the user being mentioned in a victory
 */
const VictoryMention = sequelize.define("victorymention", {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    victoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    userId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

module.exports = VictoryMention;
