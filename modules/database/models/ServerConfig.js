const { Sequelize } = require("sequelize");
const sequelize = require("../db");

// guild_id: The ID for the discord server the config is for
// alarm_role_id: The role ID for the GAT ALARM role
// gameserver_role_id: The role ID for the GAME SERVER ACCESS role
// alarm_sticky_state: The true or false state for if the gat alarm sticky message is active or not
const ServerConfig = sequelize.define("serverconfig", {
    guild_id: {
        type: Sequelize.STRING,
        defaultValue: null,
    },
    alarm_role_id: {
        type: Sequelize.STRING,
        defaultValue: null,
    },
    gameserver_role_id: {
        type: Sequelize.STRING,
        defaultValue: null,
    },
    alarm_sticky_state: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
});

module.exports = ServerConfig;
