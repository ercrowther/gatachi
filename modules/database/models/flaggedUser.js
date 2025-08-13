const { Sequelize } = require("sequelize");
const sequelize = require("../db");

// userID: The ROBLOX user ID of the user
// name: A name that represents the user
const FlaggedUser = sequelize.define("flaggeduser", {
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

module.exports = FlaggedUser;
