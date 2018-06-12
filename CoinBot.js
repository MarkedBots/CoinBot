exports.commands = ["balance"];

let api;
let helper;
let database;

exports.constructor = (api, helper) => {
    this.api = api;
    this.helper = helper;
    this.database = require("./database");

    this.database.users.sync();

    setInterval(() => {
        api.roster().then(roster => {
            roster.members.forEach(member => {
                this.database.users.findOrCreate({
                    where: {
                        id: member.userId
                    },
                    defaults: {
                        name: member.username
                    }
                }).spread((user, created) => {
                    user.balance += 10;
                    user.save().then(() => {});
                });
            });
        });
    }, 30000);
};

exports.balance = {
    execute: (command, parameters, message) => {
        this.database.users.findOrCreate({
            where: {
                id: message.userId
            },
            defaults: {
                name: message.username
            }
        }).spread((user, created) => {
            this.api.say("@" + message.username + "'s Balance: " + user.balance);
        });
    }
};
