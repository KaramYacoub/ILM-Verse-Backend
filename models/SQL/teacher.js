const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "teacher",
    {
      teacher_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        primaryKey: true,
        autoIncrement: false,
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: "teacher_email_key",
      },
      password: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      dept_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: "department",
          key: "department_id",
        },
      },
      section_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: "section",
          key: "section_id",
        },
      },
    },
    {
      sequelize,
      tableName: "teacher",
      schema: "public",
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "teacher_email_key",
          unique: true,
          fields: [{ name: "email" }],
        },
        {
          name: "teacher_pkey",
          unique: true,
          fields: [{ name: "teacher_id" }],
        },
      ],
    }
  );
};
