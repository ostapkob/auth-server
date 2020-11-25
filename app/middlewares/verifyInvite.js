const db = require("../models");
const User = db.user;

module.exports.creatorInvited = function(value) {
  return User.findOne({invite: value}, function(err, result) {
    if (err) throw err;
      console.log("==>", result._id)
    return result._id
  })
}
