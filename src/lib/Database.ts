import * as lowdb from "lowdb";
import * as FileSync from "lowdb/adapters/FileSync";

export class Database {
    private db: lowdb.LowdbSync<any>;
    private usersModel: Users;

    constructor(private log: any) {
        this.db = lowdb(new FileSync("coinbot.json"));

        this.db.defaultsDeep({
            config: {
                roster: {
                    multistream: false,
                    coins: 10,
                    time: 30
                },
                currency: {
                    name: "coin",
                    namePlural: "coins",
                    symbol: "₡"
                }
            },
            users: [],
            admins: [],
            mods: [],
        }).write();

        this.usersModel = new Users(this.db, this.log);
    }

    public database(): lowdb.LowdbSync<any> {
        return this.db;
    }

    public config(): any {
        return this.db.get("config").value();
    }

    public currency(): any {
        return this.config().currency;
    }

    public users(): Users {
        return this.usersModel;
    }

    public admins(): Array<any> {
        return this.db.get("admins").value();
    }

    public mods(): Array<any> {
        return [];
    }
}

export class Users implements Model {
    private db: lowdb.LowdbSync<any>;
    public table: string;

    constructor(db: lowdb.LowdbSync<any>, private log: any) {
        this.db = db;
        this.table = "users";
    }

    public create(data: any): UserObject {
        if (!this.has(data.userId)) {
            this.db.get(this.table)
                   .push({
                        id: data.userId,
                        name: data.name,
                        coins: 0,
                   })
                   .write();
        }

        return <UserObject>this.find(data.userId);
    }

    public findOrCreate(userId: string, defaults?: object): UserObject {
        let entry = {};

        if (this.has(userId)) {
            entry = this.find(userId);
        } else {
            entry = this.create(defaults);
        }

        return <UserObject>entry;
    }

    public find(userId: string): UserObject {
        let entry: any = this.db.get(this.table)
                      .find({ id: userId })
                      .value();

        if (entry === undefined) {
            return null;
        }

        let userobj: UserObject = {
            userId: entry.id,
            name: entry.name,
            coins: entry.coins
        };

        return userobj;
    }

    public has(userId: string): boolean {
        return this.find(userId) !== null;
    }

    public getCoins(userId: string): number {
        if (!this.has(userId)) {
            this.log.error("No user with the id " + userId + " exists.");
            return 0;
        }

        return this.find(userId).coins;
    }

    public hasCoins(userId: string, wantedAmount: number): boolean {
        if (!this.has(userId)) {
            this.log.error("No user with the id " + userId + " exists.");
            return false;
        }

        return this.find(userId).coins >= wantedAmount;
    }

    public incrementCoin(userId: string, incrementBy: number = 1): number {
        if (!this.has(userId)) {
            this.log.error("No user with the id " + userId + " exists.");
            return 0;
        }
        
        let newCoins: number = <number>this.find(userId).coins + incrementBy;

        this.db.get(this.table).find({ id: userId }).assign({ coins: newCoins }).write();

        return newCoins;
    }

    public decrementCoin(userId: string, decrementBy: number = 1): number {
        if (!this.has(userId)) {
            this.log.error("No user with the id " + userId + " exists.");
            return 0;
        }

        let newCoins: number = <number>this.find(userId).coins - decrementBy;

        this.db.get(this.table).find({ id: userId }).assign({ coins: newCoins }).write();

        return newCoins;
    }
}

export interface UserObject {
    userId: string;
    name: string;
    coins: number;
}

interface Model {
    table?: string;
    create(data: any): object;
    findOrCreate(id: any, data?: any): object;
    find(id: any): object;
    has(id: any): boolean;
}