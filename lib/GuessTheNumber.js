exports.GTN = (database, api, parameters, message) => {
    let coins = parameters[0];

    if(coins < 10) {
        api.say("You must be willing to lose at least 10 coins to play GTN.");
        return;
    }

    database.users.findById(message.userId).then(user => {
        if(user.balance < coins) {
            api.say("@" + message.username + "...you do not have enough coins to GTN.");
            return;
        }
    });

    let guess = parameters[1];
    let returnPercent = ((parameters[2] != "undefined") && (parameters[2] != null)) ? parameters[2] : 50;
    let answer = Math.floor(Math.random() * (returnPercent - 0 + 1)) + 0;

    if(guess == answer) {
        let newCoins = Math.ceil((coins/100) * returnPercent);

        database.users.findById(message.userId).then(user => {
            user.balance += newCoins;
            user.save().then(() => {
                api.say("The answer was " + answer + "! " +
                             message.username + " has won " + newCoins + ".")
            });
        });
    } else {
        database.users.findById(message.userId).then(user => {
            user.balance -= coins;
            user.save().then(() => {
                api.say("The answer was " + answer + "! " +
                             message.username + " has lost " + coins + ".")
            });
        });
    }
}
