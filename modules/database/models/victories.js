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
const Victories = sequelize.define(
    "victories",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        victoryInternalId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
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
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
    },
    {
        indexes: [{ fields: ["date"] }],
    }
);

module.exports = Victories;
