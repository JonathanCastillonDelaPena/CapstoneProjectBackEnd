//import modules
const express = require("express");
const users = require("./routes/users");
const posts = require("./routes/post");
const sql = require("./database/mySQL");
const friendlist = require("./routes/friendlist")
const cors = require("cors");

require("dotenv/config");

//middleware
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//routes
app.use("/", users);
app.use("/", posts);
app.use("/", friendlist);

//check connection of database and server if running

sql.connect((err) => {
  if (!err) {
    console.log("Database Connected");
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      process.env.AUTH_OFF=='1'?console.log(`User Authentication is Off`):console.log(`User Authentication is On`)
      console.log(`Running in port ${port}`);
    });
  } else {
    console.log("Failed Connection Due:", JSON.stringify(err.sqlMessage));
  }
});
