const { Sequelize } = require("sequelize");
const sequelize = require("../db");

/**
 * id: Normal primary key to uniquely identify each warning
 * warningId: An id exclusive to each user's warning per guild. Programatically incremented and decremented
 * userId: The user id of the user with the warning
 * guildId: The guild id where the warning was given out
 * reasoning: The admin specified reasoning for why the warn was given
 * severity: The severity of the warn (1-5) with 5 being the maximum severity
 * date: The date the warning was given
 */
const Warning = sequelize.define(
    "warning",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        warningId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        guildId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        reasoning: {
            type: Sequelize.STRING,
            defaultValue: null,
        },
        severity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        date: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: () => new Date(),
        },
    },
    {
        indexes: [
            {
                fields: ["guildId", "userId"],
            },
            {
                fields: ["userId", "warningId"],
            },
            {
                fields: ["guildId"],
            },
        ],
    }
);

module.exports = Warning;
