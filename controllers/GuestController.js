const sequelize = require("sequelize");
const SQL = require("../models/Connections/SQL-Driver"); // your Sequelize instance
const initModels = require("../models/index"); // path to index.js
const models = initModels(SQL); // initialize models
const eventMedia = require("../models/NOSQL/Event"); // your NoSQL event model
const { event } = models;
exports.getAllEvents = async (req, res) => {
  try {
    const sqlEvents = await event.findAll();
    let mergedEvents = [];

    for (const oneEvent of sqlEvents) {
      const noSqlEvent = await eventMedia.findOne({
        event_id: oneEvent.eventid,
      });

      if (!noSqlEvent) continue;
      const mergedEvent = {
        id: oneEvent.eventid,
        title: noSqlEvent.title,
        description: noSqlEvent.description,
        location: oneEvent.location,
        eventdate: oneEvent.eventdate,
        media: noSqlEvent.media.map((img) => ({
          _id: img._id,
          filename: img.path.split("\\").pop(), // Extract just the filename
        })),
      };
      mergedEvents.push(mergedEvent);
    }
    res.status(200).json({
      status: "success",
      data: mergedEvents,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
