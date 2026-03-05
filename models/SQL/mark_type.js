const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "mark_type",
    {
      type_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
      },
      type_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      weight: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 20.0,
      },
    },
    {
      sequelize,
      tableName: "mark_type",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "mark_type_pkey",
          unique: true,
          fields: [{ name: "type_id" }],
        },
      ],
    }
  );
};
