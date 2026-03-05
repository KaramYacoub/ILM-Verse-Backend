const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "student",
    {
      student_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        primaryKey: true,
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      section_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: "section",
          key: "section_id",
        },
      },
      parent_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: "parent",
          key: "parent_id",
        },
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "student",
      schema: "public",
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "student_pkey",
          unique: true,
          fields: [{ name: "student_id" }],
        },
      ],
    }
  );
};
