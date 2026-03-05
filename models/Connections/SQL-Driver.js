const { Sequelize } = require("sequelize");
sequelize = new Sequelize(process.env.SQLURL, {
  logging: false,
});

module.exports = sequelize;