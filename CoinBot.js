exports.commands = ["balance",
                    "guessthenumber",
                    "gtn",
                    "rps",
                    "give"];

let adminCommands;
let gamblingCommands;
let api;
let helper;
let database;
let permissions;

exports.constructor = (api, helper) => {
    this.api = api;
    this.helper = helper;
    this.database = require("./database");
    this.permissions = require("./database/permissions")(this.database);
    this.database.users.sync();

    this.adminCommands = require("./lib/admin")(this.database, this.api);
    this.gamblingCommands = require("./lib/user/gambling");

    setInterval(() => {
        api.roster().then(roster => {
            roster.members.forEach(member => {
                this.database.users.findOrCreate({
                    where: {
                        id: member.userId
                    },
                    defaults: {
                        name: member.slug
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
                name: message.slug
            }
        }).spread((user, created) => {
            this.api.say(message.username + "'s Balance: " + user.balance);
        });
    }
};

exports.guessthenumber = {
    execute: (command, parameters, message) => {
        this.checkForUser(message.userId, message.username);

        this.gambling.GTN(this.database, this.api, parameters, message);
    }
}

exports.gtn = {
    execute: (command, parameters, message) => {
        this.guessthenumber.execute(command, parameters, message);
    }
}

exports.rps = {
    execute: (command, parameters, message) => {
        this.checkForUser(message.userId, message.username);

        this.gamblingCommands.RPS(this.database, this.api, parameters, message);
    }
}

exports.give = {
    execute: (command, parameters, message) => {
            this.checkForUser(message.userId, message.username);

            if(this.permissions.check(message.userId, "admin") == false) {
                console.log(message.username + " attempted the admin command: give");
                return;
            }

            this.AdminCommands.give(parameters, message);
    }
}

exports.checkForUser = (userId, username) => {
    this.database.users.findOrCreate({
        where: {
            id: userId
        },
        defaults: {
            name: username.toLowerCase()
        }
    }).spread((user, created) => {});
}
