import { Database } from "../../Database";

export class Coins {
    private db: Database;
    private api: any;

    constructor(database: Database, api: any) {
        this.db = database;
        this.api = api;
    }
    
    public top5(): void {
        let message = "";
        let users = this.db.database().get("users").orderBy("coins", "desc").take(5).value();

        users.forEach((user, index, arr) => {
            if (index === (arr.length - 1)) {
                message += `${user.name} (${user.coins})`;
            } else {
                message += `${user.name} (${user.coins}), `;
            }
        });
        
        this.api.say(`Top 5: ${message}`);

        return;
    }

    public transfer(parameters: any, message: any): void {
        if (parameters[0] === undefined || parameters[1] === undefined) {
            this.api.say("The give command must include a name AND an amount. Ex: !transfer username 10");
        }

        let username: string = parameters[0].toLowerCase();
        let amount: number = Math.floor(Number(parameters[1]));
        let userEntry: any = this.db.database().get("users").find({ name: username }).value();

        if (amount === NaN || amount === undefined) {
            this.api.say("The amount you gave is not a number.");
            return;
        }

        if (amount < 1) {
            this.api.say("You must transfer more than " + amount + " coins.");
            return;
        }

        if (!this.db.users().hasCoins(message.userId, amount)) {
            this.api.say("You do not have the coins to transfer, " + message.username + ".");
            return;
        }

        if (userEntry === undefined) {
            this.api.say(username + " does not exist in the CoinBot database.");
            return;
        }

        let newCoins: number = <number>userEntry.coins + amount;

        this.db.database().get("users").find({ name: username }).assign({ coins: newCoins }).write();
        this.db.users().decrementCoin(message.userId, amount);

        this.api.say("The coins have been transfered to the account. (" + message.username + " -> " + username + ")");

        return;
    }
}