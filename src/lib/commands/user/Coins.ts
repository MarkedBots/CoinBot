import { Database } from "../../Database";
import { Helper } from "../../Helper";

export class Coins {
    private db: Database;
    private api: any;
    private i18n: any;

    constructor(database: Database, api: any, i18n: any) {
        this.db = database;
        this.api = api;
        this.i18n = i18n;
    }
    
    public top5(): void {
        let message = "";
        let users = this.db.database().get("users").orderBy("coins", "desc").take(5).value();

        users.forEach((user, index, arr) => {
            if (index === (arr.length - 1)) {
                message += `${user.name} (${Helper.formatCurrency(user.coins)})`;
            } else {
                message += `${user.name} (${Helper.formatCurrency(user.coins)}), `;
            }
        });

        this.api.say(this.i18n.get("coins.top5", this.db.messages().coins.top5, {
            "users": message
        }));

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
            this.api.say("You must transfer more than " + Helper.formatCurrency(amount) + " coins.");
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