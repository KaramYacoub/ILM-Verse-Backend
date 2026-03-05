const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "otp",
    {
      id: {
        type: DataTypes.UUIDV4,
        allowNull: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      otp_code: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "otp",
      schema: "public",
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "otp_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
