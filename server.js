const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");
var bcrypt = require("bcryptjs");

const app = express();

var corsOptions = {
  // origin: "http://192.168.99.107:8081"
  // origin: "http://127.0.0.1:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;
const User = db.user;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Hellow this server Authentication" });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  User.estimatedDocumentCount((err, count) => {
    console.log(count)
    if (!err && count === 0) {
      new User({
      username: 'admin',
      // email: 'ostap666@yandex.ru',
      invite: 'first',
      creatorInvite: 'I',
      // roles: ["admin", "manager", "user"],
      password: bcrypt.hashSync('Port2020', 8)
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added Admin");
      });
    }
  })
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "manager"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'manager' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
