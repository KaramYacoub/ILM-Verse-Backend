const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "parent",
    {
      parent_id: {
        type: DataTypes.STRING(10),
        allowNull: true,
        primaryKey: true,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      first_name: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "parent",
      schema: "public",
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "parents_pkey",
          unique: true,
          fields: [{ name: "parent_id" }],
        },
      ],
    }
  );
};
