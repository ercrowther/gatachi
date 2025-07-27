// Require Sequelize
const Sequelize = require("sequelize");

// Create a new sequelize instance to define connection information
const sequelize = new Sequelize("database", "user", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    // SQLite only
    storage: "database.sqlite",
});

module.exports = sequelize;