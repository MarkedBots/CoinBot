let Sequelize = require("sequelize");

let con = new Sequelize(null, null, null, {
    dialect: "sqlite",
    storage: "db.sqlite",
    operatorsAliases: false,
    define: {
        underscored: true
    }
});

const database = {};

database.Sequelize = Sequelize;
database.connection = con;

database.users = require("./models/User")(con, Sequelize);

module.exports = database;