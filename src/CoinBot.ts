import { Database, UserObject } from "./lib/Database";
import { Gambling } from "./lib/commands/user/Gambling";
import { Admin } from "./lib/commands/management/Admin";
import { Coins } from "./lib/commands/user/Coins";
//import { Clan } from "./lib/commands/user/Clan";
import { PubSub } from "./lib/PubSub";
import { Helper as CBHelper } from "./lib/Helper";
 
exports.commands = ["balance", "bal", 
                    "guessthenumber", "gtn", 
                    "rockpaperscissors", "rps",
                    "admin",
                    "transfer",
                    "top5",
                    "clan"];

let api;
let helper;
let log;
let pubsub;
let pubsubManager;
let i18n;
let database: Database;
let gambling: Gambling;
let adminCommand: Admin;
let coinCommand: Coins;
//let clan: Clan;

exports.constructor = (api: any, helper: any, log: any, pubsub: any, i18n: any) => {
    this.api = api;
    this.helper = helper;
    this.log = log;
    this.pubsub = pubsub;
    this.i18n = i18n;
    this.database = new Database(this.log);
    this.pubsubManager = new PubSub(this.database, this.pubsub);
    this.gambling = new Gambling(this.database, this.api);
    this.adminCommand = new Admin(this.database, this.api);
    this.coinCommand = new Coins(this.database, this.api, this.i18n);
    //this.clan = new Clan(this.database, this.api);

    CBHelper.setCBCEHelper(this.helper);
    CBHelper.setDatabase(this.database);

    require("./lib/Updater")(this.log);

    this.log.info(`CoinBot active. Will process the stream and multistream rosters every ${this.database.config().roster.time} seconds.`);

    setInterval(() => {
        this.api.roster().then((roster: any) => {
            roster.members.forEach((member: any) => {
                this.database.users().findOrCreate(member.userId, {
                    userId: member.userId,
                    name: member.slug
                });

                this.database.users().incrementCoin(member.userId, this.database.config().roster.coins);
            });
        });
    }, this.database.config().roster.time * 1000);
};

exports.balance = {
    execute: (command: any, parameters: any, message: any) => {
        let user: UserObject = this.database.users().findOrCreate(message.userId, { userId: message.userId, name: message.slug });
        
        this.api.say(message.username + "'s Balance: " + CBHelper.formatCurrency(user.coins));
    }
};

exports.bal = {
    execute: (command: any, parameters: any, message: any) => {
        this.balance.execute(command, parameters, message);
    }
};

exports.guessthenumber = {
    execute: (command: any, parameters: any, message: any) => {
        this.gambling.gtn(parameters, message);
    }
};

exports.gtn = {
    execute: (command: any, parameters: any, message: any) => {
        this.guessthenumber.execute(command, parameters, message);
    }
};

exports.rockpaperscissors = {
    execute: (command: any, parameters: any, message: any) => {
        this.gambling.rps(parameters, message);
    }
};

exports.rps = {
    execute: (command: any, parameters: any, message: any) => {
        this.rockpaperscissors.execute(command, parameters, message);
    }
};

exports.top5 = {
    execute: (command: any, parameters: any, message: any) => {
        this.coinCommand.top5();
    }
};

exports.transfer = {
    execute: (command: any, parameters: any, message: any) => {
        this.coinCommand.transfer(parameters, message);
    }
};

exports.admin = {
    execute: (command: any, parameters: any, message: any) => {
        if (!this.adminCommand.isAdmin(message.username)) {
            this.log.info(message.username + " attempted to run an admin command. Command: " + message.message);
            return;
        }

        if (parameters[0].toLowerCase() === "give") {
            if (parameters[1] === undefined || parameters[2] === undefined) {
                this.api.say("The give command must include a name AND an amount. Ex: !admin give username 10");
            }

            let username: string = parameters[1];
            let amount: number = Number(parameters[2]);

            this.adminCommand.give(username, amount);
            return;
        } else if (parameters[0].toLowerCase() === "take") {
            if (parameters[1] === undefined || parameters[2] === undefined) {
                this.api.say("The take command must include a name AND an amount. Ex: !admin take username 10");
            }

            let username: string = parameters[1];
            let amount: number = Number(parameters[2]);

            this.adminCommand.take(username, amount);
            return;
        } else if (parameters[0].toLowerCase() === "makeitrain" || parameters[0].toLowerCase() === "mir") {
            if (parameters[1] === undefined ) {
                this.api.say("The make it rain command must include an amount. Ex: !admin makeitrain 10");
            }

            let amount: number = Number(parameters[1]);

            this.api.roster().then((roster: any) => {
                roster.members.forEach((member: any) => {
                    this.database.users().findOrCreate(member.userId, {
                        userId: member.userId,
                        name: member.slug
                    });
    
                    this.database.users().incrementCoin(member.userId, amount);
                });
            });

            this.api.say(this.i18n.get("admin.makeitrain", this.database.messages().admin.makeitrain, {
                "username": message.username,
                "amount": CBHelper.formatCurrency(amount)
            }));

            return;
        } else if (parameters[0].toLowerCase() === "r*" || parameters[0].toLowerCase() === "resetall") {
            if (parameters[1] === undefined ) {
                this.api.say("The make it rain command must include an amount. Ex: !admin resetall 10");
            }

            let amount: number = Number(parameters[1]);

            this.database.database().get("users").value().forEach((el: any) => {
                this.database.database().get("users").find({ id: el.id }).assign({ coins: amount }).write();
            });

            this.api.say(`Everyone has been reset to ${CBHelper.formatCurrency(amount)}`);

            return;
        }
    }
};