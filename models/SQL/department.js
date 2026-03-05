const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "department",
    {
      department_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "department",
      schema: "public",
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "department_pkey",
          unique: true,
          fields: [{ name: "department_id" }],
        },
      ],
    }
  );
};
