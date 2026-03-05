// models/SQL/admin.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // Validate sequelize instance
  if (!sequelize || !sequelize.define) {
    throw new Error("Invalid Sequelize instance provided");
  }

  const Admin = sequelize.define(
    "admin",
    {
      gm_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        primaryKey: true,
        autoIncrement: false,
      },
      first_name: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(90),
        allowNull: true,
      },
    },
    {
      tableName: "admin",
      schema: "public",
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "admin_pkey",
          unique: true,
          fields: [{ name: "gm_id" }],
        },
      ],
    }
  );

  return Admin;
};
