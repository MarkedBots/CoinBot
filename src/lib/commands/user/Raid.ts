import { Database } from "../../Database";
import { Dungeon } from "../../helpers/Dungeon";

export class Raid {
    private db: Database;
    private api: any;
    private currentDungeonName: string = "";
    private joining: boolean = false;
    private started: boolean = false;
    private inCooldown: boolean = false;
    private cooldownLeft: number = 0;
    private cooldownTime: number = 6e5; // 10m / 600s / 600,000ms.

    constructor(database: Database, api: any) {
        this.db = database;
        this.api = api;
    }

    public execute(command: any, parameters: Array<string>, message: any): void {
        this.currentDungeonName = Dungeon.generateName();
        this.api.say("Starting raid for \"" + this.currentDungeonName + "\"");
    }

    private join(): boolean {
        return true;
    }

    private start(): void {
        //
    }

    private stop(): void {
        //
    }
}