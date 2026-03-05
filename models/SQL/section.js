const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "section",
    {
      section_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
      },
      section_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      grade_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: "grade",
          key: "grade_id",
        },
      },
    },
    {
      sequelize,
      tableName: "section",
      schema: "public",
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "section_pkey",
          unique: true,
          fields: [{ name: "section_id" }],
        },
      ],
    }
  );
};
