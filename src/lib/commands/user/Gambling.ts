import { Database } from "../../Database";

export class Gambling {
    private db: Database;
    private api: any;

    constructor(database: Database, api: any) {
        this.db = database;
        this.api = api;
    }

    public gamble(parameters: any, message: any): void {
        let coins: number = 25;
        let guess: string = "even";
        let userGuessed: boolean = false;
        let answer: number = this.getRandomInt(50, 250);

        if (parameters[0] !== undefined) {
           coins = Number(parameters[0]); 
        }

        if (!this.db.users().hasCoins(message.userId, coins)) {
            this.api.say(`${message.username}, you do not have enough coins to gamble. You need ${coins} coins.`);
            return;
        }

        if (parameters[1] !== undefined && (parameters[1].toLowerCase() !== "even" || parameters[1].toLowerCase() !== "odd")) {
            this.api.say(`${message.username}, you must choose even or odd.`);
            return;
        }

        if (parameters[1] !== undefined) {
            guess = parameters[1].toLowerCase();
            userGuessed = true;
        }
    }

    public gtn(parameters: any, message: any): void {
        let coins: number = Number(parameters[0]);
        let guess: number = Number(parameters[1]);
        let returnPercent: number = (parameters[2] !== undefined) ? Number(parameters[2]) : 50;
        let maxAnswer: number = Math.floor(returnPercent / 3);
        let answer: number = Math.ceil(Math.random() * (maxAnswer - 1 + 1)) + 1;

        if (answer > maxAnswer) {
            answer = maxAnswer;
        }

        if (coins < 5) {
            this.api.say("You must be willing to lose at least 5 coins to play GTN.");
            return;
        }

        if (!this.db.users().hasCoins(message.userId, coins)) {
            this.api.say(message.username + "...you do not have enough coins to play GTN.");
            return;
        }

        if (returnPercent < 15) {
            this.api.say(message.username + ", you need a return percent of at least 15% to play GTN.");
            return;
        }

        if (guess === answer) {
            let newCoins = Number(Math.ceil((coins / 100) * returnPercent));

            this.db.users().incrementCoin(message.userId, newCoins);

            this.api.say("The answer was " + answer + "! " +
                             message.username + " has won " + newCoins + ".");
        } else {
            this.db.users().decrementCoin(message.userId, coins);
            this.api.say("The answer was " + answer + " (0 - " + maxAnswer + ")! " +
                             message.username + " has lost " + coins + ".");
        }
    }

    public rps(parameters: Array<string>, message: any): void {
        if (parameters === null || parameters === undefined || parameters.length < 2) {
            this.api.say(message.username + ", you must include a bet and a choice!");
            return;
        }

        let coins: number = Number(parameters[0]);
        let userChoice: string = parameters[1].toLowerCase();
        let botChoicesBase: Array<string> = ["rock", "paper", "scissors"];
        let botChoices: Array<string> = [];
        let botChoice: string = "";
        let rockProb: number = 0;
        let paperProb: number = 0;
        let scissorsProb: number = 0;

        if (coins < 10) {
            this.api.say("You must be willing to lose at least 10 coins to play RPS.");
            return;
        }

        if (!this.db.users().hasCoins(message.userId, coins)) {
            this.api.say(message.username + "...you do not have enough coins to play RPS.");
            return;
        }

        switch (userChoice) {
            case "r":
                userChoice = "rock";
                break;
            case "p":
                userChoice = "paper";
                break;
            case "s":
                userChoice = "scissors";
                break;
        }

        if ((userChoice !== "rock") && (userChoice !== "paper") && (userChoice !== "scissors")) {
            this.api.say("You need to choose rock, paper, or scissors.");
            return;
        }


        while (botChoices.length < 200) {
            let choice: string = botChoicesBase[Math.floor(Math.random() * botChoicesBase.length)];
            botChoices.push(choice);
            
            switch (choice) {
                case "rock": 
                    rockProb++;
                    break;
                case "paper":
                    paperProb++;
                    break;
                case "scissors":
                    scissorsProb++;
                    break;
            }
        }

        botChoice = botChoices[Math.floor(Math.random() * botChoices.length)];

        if (parameters.indexOf("--show-probability") > -1) {
            this.api.say("Probabilities: Rock " + (rockProb / 2) + "%, Paper " + (paperProb / 2) + "%, Scissors " + (scissorsProb / 2) + "%");
        }

        if (userChoice === botChoice) {
            this.api.say("We tied " + message.username + "! I won't take anything from you.");
            return;
        } else if (userChoice === "rock") {
            if (botChoice === "scissors") {
                this.db.users().incrementCoin(message.userId, coins);
                this.api.say("I chose " + botChoice + ". I guess you win, " + message.username + ". Here's " + coins + " coins.");
                return;
            }
        } else if (userChoice === "paper") {
            if (botChoice === "rock") {
                this.db.users().incrementCoin(message.userId, coins);
                this.api.say("I chose " + botChoice + ". I guess you win, " + message.username + ". Here's " + coins + " coins.");
                return;
            }
        } else if (userChoice === "scissors") {
            if (botChoice === "paper") {
                this.db.users().incrementCoin(message.userId, coins);
                this.api.say("I chose " + botChoice + ". I guess you win, " + message.username + ". Here's " + coins + " coins.");
                return;
            }
        }

        this.db.users().decrementCoin(message.userId, coins);
        this.api.say("I chose " + botChoice + ". I win! Thanks for " + coins + " coins " + message.username + "!");
    }

    private getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}