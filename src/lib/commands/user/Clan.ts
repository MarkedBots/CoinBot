import { Database } from "../../Database";

export class Clan {
    private db: Database;
    private api: any;

    constructor(database: Database, api: any) {
        this.db = database;
        this.api = api;
    }

    public execute(command: any, parameters: Array<string>, message: any): void {
        //
    }

    private create(): void {
        //
    }

    private disband(): void {
        //
    }
}