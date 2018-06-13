exports.commands = ["balance", "guessthenumber", "gtn"];

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

exports.guessthenumber = {
    execute: (command, parameters, message) => {
        this.checkForUser(message.userId, message.username);

        let coins = parameters[0];

        if(coins < 10) {
            this.api.say("You must be willing to lose at least 10 coins to play GTN.");
            return;
        }

        this.database.users.findById(message.userId).then(user => {
            if(user.balance < coins) {
                this.api.say("@" + message.username + "...you do not have enough coins to GTN.");
                return;
            }
        });

        let guess = parameters[1];
        let returnPercent = ((parameters[2] != "undefined") && (parameters[2] != null)) ? parameters[2] : 50;
        let answer = Math.floor(Math.random() * (returnPercent - 0 + 1)) + 0;

        if(guess == answer) {
            let newCoins = Math.ceil((coins/100) * returnPercent);

            this.database.users.findById(message.userId).then(user => {
                user.balance += newCoins;
                user.save().then(() => {
                    this.api.say("The answer was " + answer + "! " +
                                 message.username + " has won " + newCoins + ".")
                });
            });
        } else {
            this.database.users.findById(message.userId).then(user => {
                user.balance -= coins;
                user.save().then(() => {
                    this.api.say("The answer was " + answer + "! " +
                                 message.username + " has lost " + coins + ".")
                });
            });
        }
    }
}

exports.gtn = {
    execute: (command, parameters, message) => {
        this.guessthenumber.execute(command, parameters, message);
    }
}

exports.checkForUser = (userId, username) => {
    this.database.users.findOrCreate({
        where: {
            id: userId
        },
        defaults: {
            name: username
        }
    }).spread((user, created) => {});
}
