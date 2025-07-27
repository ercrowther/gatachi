const { Sequelize } = require("sequelize");
const sequelize = require("../db");

// guild_id: The ID for the discord server the config is for
// alarm_role_id: The role ID for the GAT ALARM role
// gameserver_role_id: The role ID for the GAME SERVER ACCESS role
const ServerConfig = sequelize.define("serverconfig", {
    guild_id: Sequelize.STRING,
    alarm_role_id: Sequelize.STRING,
    gameserver_role_id: Sequelize.STRING,
});

module.exports = ServerConfig;
