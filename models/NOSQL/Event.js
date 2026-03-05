const mongoose = require("mongoose");

// Define the Event Schema
const eventSchema = new mongoose.Schema({
  event_id: {
    type: String, // Manually set the event_id when creating the document
    required: true,
  },
  title: {
    type: String, // Manually set the event_id when creating the document
    required: true,
  },
  description: {
    type: String, // Manually set the event_id when creating the document
    required: true,
  },
  media: [
    {
      path: {
        type: String, // Path to the media file (could be URL or file path)
        required: true,
      },
      type: {
        type: String, // Type of the media (e.g., image, video, audio)
        required: true,
      },
    },
  ],
});

// Create the Event model
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
