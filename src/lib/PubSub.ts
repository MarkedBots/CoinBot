import { Database } from "./Database";

export class PubSub {
    public db: Database;
    public constructor(db: Database, private pubsub: any) {
        this.db = db;

        this.pubsub.subscribe("coinbot.increment", (data: any, topic: any) => {
            return this.db.users().incrementCoin(data.userId, data.amount);
        });

        this.pubsub.subscribe("coinbot.decrement", (data: any, topic: any) => {
            return this.db.users().decrementCoin(data.userId, data.amount);
        });
        
        this.pubsub.subscribe("coinbot.hasCoins", (data: any, topic: any) => {
            return this.db.users().hasCoins(data.userId, data.amount);
        });

        this.pubsub.subscribe("coinbot.getCoins", (data: any, topic: any) => {
            return this.db.users().getCoins(data.userId);
        });
    }
}