import { Database } from "../../Database";
import { Dungeon } from "../../helpers/Dungeon";
let stopwatch = require("timer-stopwatch");

export class Raid {
    private db: Database;
    private api: any;
    private currentDungeonName: string = "";
    private joining: boolean = false;
    private started: boolean = false;
    private inCooldown: boolean = false;
    private cooldownLeft: number = 0;
    private cooldownTime: number = 3e5; // 10m / 600s / 600,000ms / 6e5
    private joiningTime: number = 3e5; // 5m / 300s / 300,000ms / 3e5
    private raidingTime: number = 12e4; // 2m / 120s / 120,000ms / 12e4
    private players: Array<string> = [];
    private playersName: Array<string> = [];
    private timerCooldown = new stopwatch(this.cooldownTime);
    private timerJoining = new stopwatch(this.joiningTime);
    private timerRaid = new stopwatch(this.raidingTime);

    constructor(database: Database, api: any) {
        this.db = database;
        this.api = api;
    }

    public execute(command: any, parameters: Array<string>, message: any): void {
        if (this.inCooldown) {
            this.api.say("We have to wait for the next raid.");
            
            return;
        }

        if (parameters === null || parameters.length < 1) {
            if (this.joining) {
                this.api.say("The raid is already in the joining stage. Join with " + process.env.COMMAND_PREFIX + "raid join");
            } else if (this.started) {
                this.api.say("The raid has already started, please wait for the next raid.");
            } else {
                this.timerCooldown = new stopwatch(this.cooldownTime);
                this.timerJoining = new stopwatch(this.joiningTime);
                this.timerRaid = new stopwatch(this.raidingTime);

                this.currentDungeonName = Dungeon.generateName();
                this.api.say("Starting raid for \"" + this.currentDungeonName + "\". Join with " + process.env.COMMAND_PREFIX + "raid join");
                this.start();
            }
        } else if (parameters[0].toLowerCase() === "join") {
            this.join(message.userId, message.username);
        } else if (parameters[0].toLowerCase() === "list") {
            if (this.started || this.joining) {
                this.api.say("Raid Party: " + this.playersName.join(", "));
            }

            return;
        } else if (parameters[0].toLowerCase() === "status") {
            let msg = "Raid Status: ";

            if (this.inCooldown) {
                msg += "In Cooldown";
            } else if (this.joining) {
                msg += "Joining/Preparation";
            } else if (this.started) {
                msg += "Started/Raiding";
            }

            this.api.say(msg);
            return;
        }
    }

    private join(userId: string, username: string): void {
        if (!this.db.users().hasCoins(userId, 100)) {
            this.api.say("Sorry, " + username + ", but you must have at least 100 coins to join the raid.");
            return;
        }

        if (this.players.length >= 10) {
            this.api.say(`Sorry ${username} we have a full party (max 15 people).`);
            return;
        }

        if (this.inCooldown) {
            this.api.say(`${username}, we're in cooldown mode. Calm yourself.`);
            return;
        }

        if (this.started) {
            this.api.say(`${username}, you can not join a raid that is in progress!`);
            return;
        }

        if (this.players.indexOf(userId) < 0) {
            this.api.say(username + " has joined the raid!");
            this.players.push(userId);
            this.playersName.push(username);
            this.db.users().decrementCoin(userId, 100);
            return;
        } else {
            this.api.say(username + ", you're already a part of this raid.");
            return;
        }
    }

    private start(): void {
        this.joining = true;
        this.players = [];
        this.playersName = [];
        
        this.timerJoining.start();

        this.timerJoining.on("almostdone", () => {
            this.api.say("The raid is starting in 10 seconds.");
        });

        this.timerJoining.on("done", () => {
            this.joining = false;
            return this.raid();
        });
    }

    private raid(): void {
        if (this.players.length < 1) {
            this.api.say(`The raid for "${this.currentDungeonName}" has been cancelled due to lack of interest.`);
            return this.stop();
        }

        this.started = true;
        let successChance = Math.floor(5 + (this.players.length * 5));
        let loot = this.getRandomInt(1e3, 1e5);

        loot = Math.floor(loot + (this.players.length * 100));

        this.api.say(`The raid for "${this.currentDungeonName}" has begun. We have a ${successChance}% chance of success. We're looking at a total loot of ${loot} coins.`);
        this.api.say("Raid Party: " + this.playersName.join(", "));

        this.timerRaid.start();

        this.timerRaid.on("done", () => {
            let result = this.getRandomInt(0, 100);

            if (result <= successChance) {
                let remainder = loot % this.players.length;
                loot = loot - remainder;

                let lootSplit = Math.floor(loot / this.players.length);

                this.players.forEach(player => {
                    this.db.users().incrementCoin(player, lootSplit);
                });

                this.db.users().incrementCoin(this.players[0], remainder);

                this.api.say(`The raid on "${this.currentDungeonName}" was a success! Everyone got ${lootSplit} coins and ${this.playersName[0]} got and extra ${remainder} coin(s) as a finders fee.`);
            } else {
                this.api.say(`Well, we attempted the raid on "${this.currentDungeonName}," but we lost. Each 100 coin buyin was spent on medical bills.`);
            }


            this.started = false;
            return this.stop();
        });
    }

    private stop(): void {
        this.inCooldown = true;
        this.players = [];
        this.playersName = [];

        this.timerCooldown.start();

        this.timerCooldown.on("done", () => {
            this.started = false;
            this.joining = false;
            this.inCooldown = false;
        });
    }
    
    private getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}