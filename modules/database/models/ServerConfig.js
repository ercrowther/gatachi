const { Sequelize } = require("sequelize");
const sequelize = require("../db");

const ServerConfig = sequelize.define("serverconfig", {
    guild_id: Sequelize.STRING,
    alarm_role_id: Sequelize.STRING,
    gameserver_role_id: Sequelize.STRING,
});

module.exports = ServerConfig;
