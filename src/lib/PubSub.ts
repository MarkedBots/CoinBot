import { Database } from "./Database";

export class PubSub {
    public db: Database;
    public constructor(db: Database, private pubsub: any) {
        this.db = db;

        this.pubsub.subscribe("economy.incrementBalance", (data: any, topic: any) => {
            return this.db.users().incrementCoin(data.userId, data.amount);
        });

        this.pubsub.subscribe("economy.decrementBalance", (data: any, topic: any) => {
            return this.db.users().decrementCoin(data.userId, data.amount);
        });
        
        this.pubsub.subscribe("economy.hasBalance", (data: any, topic: any) => {
            return this.db.users().hasCoins(data.userId, data.amount);
        });

        this.pubsub.subscribe("economy.getBalance", (data: any, topic: any) => {
            return this.db.users().getCoins(data.userId);
        });
    }
}