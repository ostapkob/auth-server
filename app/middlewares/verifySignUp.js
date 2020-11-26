const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    username: req.body.username
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      // res.status(400).send({ message: "Failed! Username is already in use!" });
      res.status(400).send({ message: "Такое имя пользователя уже существует" });
      return;
    }

    // Email
    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (user) {
        res.status(400).send({ message: "Failed! Email is already in use!" });
        return;
      }

      next();
    });
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
        return;
      }
    }
  }
  next();
};

checkInvite = (req, res, next) => {
  // if (req.body.invite != '111') {
  //   res.status(400).send({
  //     message: 'Invite is not correct' 
  //   });
  //   return;
  // }
    
    User.findOne({
      invite: req.body.invite
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!user) {
        // res.status(400).send({ message: `Failed! Invite not correct )` });
        res.status(400).send({ message: 'Ошибка. Код-приглашения не верен!' });
        return ;
      }
        user.invite = Math.random().toString(36).substring(3);
        user.save();
      next();
    });
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted,
  checkInvite
};

module.exports = verifySignUp;
