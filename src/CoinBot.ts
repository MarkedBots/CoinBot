import { Database, UserObject } from "./lib/Database";
import { Gambling } from "./lib/commands/user/Gambling";

exports.commands = ["balance", "bal", 
                    "guessthenumber", "gtn", 
                    "rockpaperscissors", "rps"];

let api;
let helper;
let database: Database;
let gambling: Gambling;

exports.constructor = (api: any, helper: any) => {
    this.api = api;
    this.helper = helper;
    this.database = new Database();
    this.gambling = new Gambling(this.database, this.api);

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