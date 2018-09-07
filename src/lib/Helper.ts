import { Database } from "./Database";

export class Helper {
    private static db: Database;
    private static cbceHelper: any;

    public static setDatabase(database: Database): void {
        this.db = database;
    }

    public static setCBCEHelper(helper: any): void {
        this.cbceHelper = helper;
    }

    public static formatCurrency(amount: number): string {
        return `${this.cbceHelper.withCommas(amount)}${this.db.currency().symbol}`;
    }
}