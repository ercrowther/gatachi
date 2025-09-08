const { Sequelize } = require("sequelize");
const sequelize = require("../db");

/**
 * id: Normal primary key to uniquely identify each victory
 * victoryId: A programatically incremented and decremented id to be user friendly for admins
 * ragequits: The amount of ragequits for the victory
 * standdowns: The amount of standdowns for the victory
 * terminations: The amount of bans for the victory
 * imageUrl: The image url of a screenshot from the victory, if one exists
 * date: The date of the victory in the format 'yyyy-mm-dd'
 */
const Victory = sequelize.define("victory", {
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
    ragequits: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    standdowns: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    terminations: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    imageUrl: {
        type: Sequelize.STRING,
        defaultValue: null,
    },
    date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
});

module.exports = Victory;
