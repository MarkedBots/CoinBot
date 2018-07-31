import { Database } from "../../Database";

export class Raid {
    private db: Database;
    private api: any;

    constructor(database: Database, api: any) {
        this.db = database;
        this.api = api;
    }

    public execute(command: any, parameters: Array<string>, message: any): void {
        this.api.say("Raid mode is being developed.");
    }
}