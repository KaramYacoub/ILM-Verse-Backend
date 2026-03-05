const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "student_marks",
    {
      mark_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      course_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: "course",
          key: "course_id",
        },
        onDelete: "CASCADE",
      },
      student_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: "student",
          key: "student_id",
        },
        onDelete: "CASCADE",
      },
      type_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: "mark_type",
          key: "type_id",
        },
      },
      mark_value: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      mark_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "student_marks",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "student_marks_pkey",
          unique: true,
          fields: [{ name: "mark_id" }],
        },
      ],
    }
  );
};
