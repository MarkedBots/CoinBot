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
    private buyInAmount: number = 100;
    private defaultBuyInAmount: number = 100;
    private minBuyInAmount: number = 100;
    private cooldownTime: number = 30000; 
    private joiningTime: number = 60000;
    private raidingTime: number = 15000;
    private players: Array<string> = [];
    private playersName: Array<string> = [];
    private timerCooldown = new stopwatch(this.cooldownTime);
    private timerJoining = new stopwatch(this.joiningTime);
    private timerRaid = new stopwatch(this.raidingTime);

    constructor(database: Database, api: any) {
        this.db = database;
        this.api = api;

        this.cooldownTime = this.db.config().features.raid.timers.cooldown * 1000;
        this.raidingTime = this.db.config().features.raid.timers.raiding * 1000;
        this.joiningTime = this.db.config().features.raid.timers.joining * 1000;
        this.defaultBuyInAmount = Number(this.db.config().features.raid.defaultBuyIn);
        this.minBuyInAmount = Number(this.db.config().features.raid.minimumBuyIn);
        this.buyInAmount = this.defaultBuyInAmount;
    }

    public execute(command: any, parameters: Array<string>, message: any): void {
        if (this.inCooldown) {
            this.api.say("We have to wait for the next raid.");
            
            return;
        }

        if (parameters === null || parameters.length < 1 || (parameters !== null && parameters.length >= 1 && !isNaN(parseInt(parameters[0])))) {
            if (this.joining) {
                this.api.say("The raid is already in the joining stage. Join with " + process.env.COMMAND_PREFIX + "raid join");
            } else if (this.started) {
                this.api.say("The raid has already started, please wait for the next raid.");
            } else {
                this.timerCooldown = new stopwatch(this.cooldownTime);
                this.timerJoining = new stopwatch(this.joiningTime);
                this.timerRaid = new stopwatch(this.raidingTime);

                if (parameters !== null && parameters.length >= 1 && !isNaN(parseInt(parameters[0]))) {
                    this.buyInAmount = Number(parameters[0]);

                    if (this.buyInAmount < this.minBuyInAmount) {
                        this.api.say(`The raid buyin must be ${this.minBuyInAmount} or more coins!`);
                        return;
                    }
                } else {
                    this.buyInAmount = this.defaultBuyInAmount;
                }

                this.currentDungeonName = Dungeon.generateName();
                this.api.say(`Starting raid for "${this.currentDungeonName}". Join with ${process.env.COMMAND_PREFIX} raid join`);
                this.start();
                this.join(message.userId, message.username);
            }
        } else if (parameters[0].toLowerCase() === "join") {
            this.join(message.userId, message.username);
        } else if (parameters[0].toLowerCase() === "list") {
            if (this.started || this.joining) {
                this.api.say(`Raid Party (${this.players.length}): ${this.playersName.join(", ")}`);
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
        if (!this.db.users().hasCoins(userId, this.buyInAmount)) {
            this.api.say(`Sorry, ${username}, but you must have at least ${this.buyInAmount} coins to join the raid.`);
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
            this.api.say(`${username} has joined the raid!`);
            this.players.push(userId);
            this.playersName.push(username);
            this.db.users().decrementCoin(userId, this.buyInAmount);
            return;
        } else {
            this.api.say(`${username}, you're already a part of this raid.`);
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

        if (this.buyInAmount > 100) {
            let moreChance = Math.floor(this.buyInAmount / 100) < 15 ? Math.floor(this.buyInAmount / 100) : 15;
            successChance = successChance + moreChance;
        }

        let loot = this.getRandomInt(1e3, 1e5);
        loot = Math.floor(loot + (this.players.length * this.buyInAmount));

        this.api.say(`The raid for "${this.currentDungeonName}" has begun. We have a ${successChance}% chance of success. We're looking at a total loot of ${loot} coins.`);
        this.api.say(`Raid Party (${this.players.length}): ${this.playersName.join(", ")}`);

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
                this.api.say(`Well, we attempted the raid on "${this.currentDungeonName}," but we lost. Each ${this.buyInAmount} coins buyin was spent on medical bills.`);
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