const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "course_student",
    {
      course_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
        references: {
          model: "course",
          key: "course_id",
        },
      },
      student_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
        references: {
          model: "student",
          key: "student_id",
        },
      },
    },
    {
      sequelize,
      tableName: "course_student",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "pk_course_student",
          unique: true,
          fields: [{ name: "course_id" }, { name: "student_id" }],
        },
      ],
    }
  );
};
