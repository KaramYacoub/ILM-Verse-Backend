const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "course",
    {
      course_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        primaryKey: true,
      },
      subject_name: {
        type: DataTypes.STRING(100),
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
      teacher_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        references: {
          model: "teacher",
          key: "teacher_id",
        },
      },
    },
    {
      sequelize,
      tableName: "course",
      schema: "public",
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "course_pkey",
          unique: true,
          fields: [{ name: "course_id" }],
        },
      ],
    }
  );
};
