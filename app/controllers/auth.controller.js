const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// function creatorInvite(value, callback) {
//   User.findOne({invite: value}).exec((err, user) => {
//     if (err) console.log(err)
//     if (user === null) {
//       callback(null)
//     } 
//     else {
//       callback(user.username)
//     }
//   })
// }

exports.signup = (req, res) => {
  // i don't now how do this correct
  console.log(req.body)
  User.findOne({invite: req.body.invite}).exec((err, creator) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
    const user = new User({
      username: req.body.username,
      // email: req.body.email,
      invite: Math.random().toString(36).substring(3),
      date: Date(),
      creatorInvite: creator.username, //creatorInvite('llylv6cye'),
      password: bcrypt.hashSync(req.body.password, 8)
    });
    user.save((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (req.body.invite === undefined)  {
        // return res.status(404).send({ message: "Need an invite." });
        return res.status(404).send({ message: "Нужно получить приглашение от уже зарегистрированного сотрудника." });
        return;
      }
      if (req.body.roles) {
        Role.find(
          {
            name: { $in: req.body.roles }
          },
          (err, roles) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            user.roles = roles.map(role => role._id);
            user.save(err => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }

              // res.send({ message: "User was registered successfully!" });
              res.send({ message: "Вы успешно зарегистрированны." });
            });
          }
        );
      } else {
        Role.findOne({ name: "user" }, (err, role) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = [role._id];
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            // res.send({ message: "User was registered successfully!" });
              res.send({ message: "Вы успешно зарегистрированны." });
          });
        });
      }
    });
  })
};

exports.signin = (req, res) => {
  console.log('-->', req.body)
  if (req.body.password === undefined || req.body.username ===undefined) {
    return res.status(400).send({ message: "Bad request keys: username or password." });
    // return res.status(400).send({ message: "Такое имя пользователя уже существует" });
  }
  User.findOne({
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        // return res.status(404).send({ message: "User Not found." });
        return res.status(404).send({ message: "Пользователь не найден." });
      }
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          // message: "Invalid Password!"
          message: "Не верный пароль."
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 3600*24 // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        // email: user.email,
        invite: user.invite,
        roles: authorities,
        accessToken: token
      });
    });
};
