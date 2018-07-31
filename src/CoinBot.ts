import { Database, UserObject } from "./lib/Database";
import { Gambling } from "./lib/commands/user/Gambling";
import { Admin } from "./lib/commands/management/Admin";

exports.commands = ["balance", "bal", 
                    "guessthenumber", "gtn", 
                    "rockpaperscissors", "rps",
                    "admin"];

let api;
let helper;
let database: Database;
let gambling: Gambling;
let adminCommand: Admin;

exports.constructor = (api: any, helper: any) => {
    this.api = api;
    this.helper = helper;
    this.database = new Database();
    this.gambling = new Gambling(this.database, this.api);
    this.adminCommand = new Admin(this.database, this.api);

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
        }
    }
};