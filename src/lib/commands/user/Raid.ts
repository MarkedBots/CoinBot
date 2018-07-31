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
        if (parameters === null || parameters.length < 1) {
            if (this.joining) {
                this.api.say("The raid is already in the joining stage. Join with " + process.env.COMMAND_PREFIX + "raid join");
            } else if (this.started) {
                this.api.say("The raid has already started, please wait for the next raid.");
            } else {
                this.currentDungeonName = Dungeon.generateName();
                this.api.say("Starting raid for \"" + this.currentDungeonName + "\". Join with " + process.env.COMMAND_PREFIX + "raid join");
                this.start();
            }
        }
    }

    private join(): boolean {
        return true;
    }

    private start(): void {
        this.joining = true;

        setTimeout(() => {
            this.joining = false;
            this.started = true;

            this.api.say("The raid of \"" + this.currentDungeonName + "\" has begun.");
            this.raid();
        }, 12e4);
    }

    private raid(): void {
        //
    }

    private stop(): void {
        //
    }
}