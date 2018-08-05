import { Database, UserObject } from "./lib/Database";
import { Gambling } from "./lib/commands/user/Gambling";
import { Admin } from "./lib/commands/management/Admin";
import { Raid } from "./lib/commands/user/Raid";

exports.commands = ["balance", "bal", 
                    "guessthenumber", "gtn", 
                    "rockpaperscissors", "rps",
                    "admin",
                    "raid",
                    "transfer"];

let api;
let helper;
let database: Database;
let gambling: Gambling;
let adminCommand: Admin;
let raid: Raid; // This handles all raid related commands.

exports.constructor = (api: any, helper: any) => {
    this.api = api;
    this.helper = helper;
    this.database = new Database();
    this.gambling = new Gambling(this.database, this.api);
    this.adminCommand = new Admin(this.database, this.api);
    this.raid = new Raid(this.database, this.api);

    setInterval(() => {
        console.log("Fetching roster and updating coins.");

        this.api.roster().then((roster: any) => {
            roster.members.forEach((member: any) => {
                this.database.users().findOrCreate(member.userId, {
                    userId: member.userId,
                    name: member.slug
                });

                this.database.users().incrementCoin(member.userId, 10);
            });
        });
    }, 30000);
};

exports.balance = {
    execute: (command: any, parameters: any, message: any) => {
        let user: UserObject = this.database.users().findOrCreate(message.userId, { userId: message.userId, name: message.slug });

        this.api.say(message.username + "'s Balance: " + user.coins);
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

exports.transfer = {
    execute: (command: any, parameters: any, message: any) => {
        if (parameters[0] === undefined || parameters[1] === undefined) {
            this.api.say("The give command must include a name AND an amount. Ex: !transfer username 10");
        }

        let username: string = parameters[0].toLowerCase();
        let amount: number = Number(parameters[1]);
        let userEntry: any = this.database.database().get("users").find({ name: username }).value();

        if (amount === NaN || amount === undefined) {
            this.api.say("The amount you gave is not a number.");
            return;
        }

        if (amount < 1) {
            this.api.say("You must transfer more than " + amount + " coins.");
            return;
        }

        if (!this.database.users().hasCoins(message.userId, amount)) {
            this.api.say("You do not have the coins to transfer, " + message.username + ".");
            return;
        }

        if (userEntry === undefined) {
            this.api.say(username + " does not exist in the CoinBot database.");
            return;
        }

        let newCoins: number = <number>userEntry.coins + amount;

        this.database.database().get("users").find({ name: username }).assign({ coins: newCoins }).write();
        this.database.users().decrementCoin(message.userId, amount);

        this.api.say("The coins have been transfered to the account. (" + message.username + " -> " + username + ")");

        return;
    }
};

exports.admin = {
    execute: (command: any, parameters: any, message: any) => {
        if (!this.adminCommand.isAdmin(message.username)) {
            console.info(message.username + " attempted to run an admin command. Command: " + message.message);
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
        } 
    }
};