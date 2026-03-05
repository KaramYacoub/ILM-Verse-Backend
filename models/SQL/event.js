const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "event",
    {
      eventid: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      eventdate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_DATE"),
      },
      location: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "event",
      schema: "public",
      hasTrigger: true,
      timestamps: false,
      indexes: [
        {
          name: "event_pkey",
          unique: true,
          fields: [{ name: "eventid" }],
        },
      ],
    }
  );
};
