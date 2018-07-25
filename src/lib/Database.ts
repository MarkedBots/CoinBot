import * as lowdb from "lowdb";
import * as FileSync from "lowdb/adapters/FileSync";

export class Database {
    private db: lowdb.LowdbSync<any>;
    private usersModel: Users;

    constructor() {
        this.db = lowdb(new FileSync("coinbot.json"));

        this.db.defaults({
            users: []
        }).write();

        this.usersModel = new Users(this.db);
    }

    public users(): Users {
        return this.usersModel;
    }
}

export class Users implements Model {
    private db: lowdb.LowdbSync<any>;
    public table: string;

    constructor(db: lowdb.LowdbSync<any>) {
        this.db = db;
        this.table = "users";
    }

    public create(data: any): object {
        if (!this.has(data.userId)) {
            this.db.get(this.table)
                   .push({
                        id: data.userId,
                        name: data.name,
                        coins: 0,
                   })
                   .write();
        }

        return this.find(data.userId);
    }

    public findOrCreate(userId: string, defaults?: object): object {
        if (this.has(userId)) {
            return this.find(userId);
        } else {
            return this.create(defaults);
        }
    }

    public find(userId: string): object {
        return this.db.get(this.table)
                      .find({ id: userId })
                      .value();
    }

    public has(userId: string): boolean {
        return this.find(userId) !== undefined;
    }
}

interface Model {
    table?: string;
    create(data: any): object;
    findOrCreate(id: any, data?: any): object;
    find(id: any): object;
    has(id: any): boolean;
}