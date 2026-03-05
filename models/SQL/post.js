const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "post",
    {
      postid: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
      },
      postdate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_DATE"),
      },
      location: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      adminid: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: "admin",
          key: "gm_id",
        },
      },
    },
    {
      sequelize,
      tableName: "post",
      schema: "public",
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "post_pkey",
          unique: true,
          fields: [{ name: "postid" }],
        },
      ],
    }
  );
};
