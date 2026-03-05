const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "./config.env") });
//-----------------------------------------------------------
// app , socket ,port imports(to run the server)
const app = require("./app.js");
const port = process.env.BACKEND_PORT;

//-----------------------------------------------------------

// PG SQL Connection
const sequelize = require("./models/Connections/SQL-Driver");
sequelize
  .authenticate()
  .then(() => {
    console.log("SQL Connection has been established successfully.");
  })
  .catch((err) => {
    console.log(err);
  });
// Mongo (NOSQL) Connection
const mongoose = require("mongoose");
mongoose
  .connect(process.env.NOSQLURL)
  .then(() => {
    console.log("NoSQL connection Completed");
  })
  .catch((err) => {
    console.log(err);
  });

// Start the server (HTTP + WebSocket)
app.listen(port, () => {
  console.log(`🚀 Socket Server + App running at http://localhost:${port}`);
});

// When Shutting Down The Server
process.on("SIGINT", () => {
  sequelize.close();
  console.log("🔌 SQL DB connection closed.");
  mongoose.disconnect();
  console.log("🔌 NOSQL DB connection closed.");
  process.exit(0);
});
