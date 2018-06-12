exports.commands = ["balance"];

let api;
let helper;
let database;

exports.constructor = (api, helper) => {
    this.api = api;
    this.helper = helper;
    this.database = require("./database");

    this.database.users.sync();

    api.roster().then(roster => {
      roster.members.forEach(member => {
        this.database.users.findOrCreate({
          where: {
            id: member.userId
          },
          defaults: {
            name: member.username
          }
        }).spread((user, created) => {});
      });
    });
};

exports.balance = {

};
