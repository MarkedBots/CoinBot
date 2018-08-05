import { Database } from "../../Database";

export class Admin {
    private db: Database;
    private api: any;

    constructor(database: Database, api: any) {
        this.db = database;
        this.api = api;
    }

    public give(username: string, amount: number): void {
        username = username.toLowerCase();

        let userEntry: any = this.db.database().get("users").find({ name: username }).value();

        if (amount === NaN || amount === undefined) {
            this.api.say("The amount you gave is not a number.");
            return;
        }

        if (amount < 1) {
            this.api.say("You must give more than " + amount + " coins.");
            return;
        }

        if (userEntry === undefined) {
            this.api.say(username + " does not exist in the CoinBot database.");
            return;
        }

        let newCoins: number = <number>userEntry.coins + amount;

        this.db.database().get("users").find({ name: username }).assign({ coins: newCoins }).write();

        this.api.say("The coins have been applied to the account (" + username + ")");

        return;
    }

    public take(username: string, amount: number): void {
        username = username.toLowerCase();

        let userEntry: any = this.db.database().get("users").find({ name: username }).value();

        if (amount === NaN || amount === undefined) {
            this.api.say("The amount you gave is not a number.");
            return;
        }

        if (amount < 1) {
            this.api.say("You must take more than " + amount + " coins.");
            return;
        }

        if (userEntry === undefined) {
            this.api.say(username + " does not exist in the CoinBot database.");
            return;
        }

        let newCoins: number = <number>userEntry.coins - amount;

        if (newCoins < 0) {
            newCoins = 0;
        }

        this.db.database().get("users").find({ name: username }).assign({ coins: newCoins }).write();

        this.api.say("The coins have been taken from the account (" + username + ")");

        return;
    }

    public isAdmin(username: string): boolean {
        return this.db.admins().indexOf(username) > -1;
    }
}