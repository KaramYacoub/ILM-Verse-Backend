const Sequelize = require("sequelize");
const department = require("./department");
const moment = require("moment-timezone");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "announcment",
    {
      announcmentid: {
        type: DataTypes.STRING(20),
        allowNull: true,
        primaryKey: true,
      },
      announcmentdate: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: () => moment().tz("Asia/Amman").format("YYYY-MM-DD"), // Jordanian date
      },
      sentat: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: () => moment().tz("Asia/Amman").format("HH:mm:ss"), // Jordanian time
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      adminid: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: "admin",
          key: "gm_id",
        },
      },
      department_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        references: {
          model: "department",
          key: "department_id",
        },
      },
    },
    {
      sequelize,
      tableName: "announcment",
      schema: "public",
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "announcment_pkey",
          unique: true,
          fields: [{ name: "announcmentid" }],
        },
      ],
    }
  );
};
