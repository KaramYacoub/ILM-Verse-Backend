const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "grade",
    {
      grade_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
      },
      grade_name: {
        type: DataTypes.STRING(50),
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
    },
    {
      sequelize,
      tableName: "grade",
      schema: "public",
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "grade_pkey",
          unique: true,
          fields: [{ name: "grade_id" }],
        },
      ],
    }
  );
};
