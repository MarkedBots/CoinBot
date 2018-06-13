exports.GTN = (database, api, parameters, message) => {
    let coins = parameters[0];

    if(coins < 10) {
        api.say("You must be willing to lose at least 10 coins to play GTN.");
        return;
    }

    database.users.findById(message.userId).then(user => {
        if(user.balance < coins) {
            api.say(message.username + "...you do not have enough coins to GTN.");
            return;
        }
    });

    let guess = parameters[1];
    let returnPercent = ((parameters[2] != "undefined") && (parameters[2] != null)) ? parameters[2] : 50;
    let maxAnswer = Math.floor(returnPercent / 2);
    let answer = Math.floor(Math.random() * (maxAnswer - 0 + 1)) + 0;

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
                api.say("The answer was " + answer + " (0 - " + maxAnswer + ")! " +
                             message.username + " has lost " + coins + ".")
            });
        });
    }
}

exports.RPS = (database, api, parameters, message) => {
    let coins = parameters[0];
    let userChoice = parameters[1].toLowerCase();
    let botChoice = "";

    if(coins < 10) {
        api.say("You must be willing to lose at least 10 coins to play RPS.");
        return;
    }

    database.users.findById(message.userId).then(user => {
        if(user.balance < coins) {
            api.say(message.username + "...you do not have enough coins to RPS.");
            return;
        }
    });

    if((userChoice != "rock") && (userChoice != "paper") && (userChoice != "scissors")) {
        api.say("You need to choose rock, paper, or scissors.");
        return;
    }

    switch(Math.floor(Math.random() * (2 - 0 + 1)) + 0) {
        case 0:
            botChoice = "rock";
            break;
        case 1:
            botChoice = "paper";
            break;
        case 2:
            botChoice = "scissors";
            break;
    }

    if(userChoice == botChoice) {
        api.say("We tied " + message.username + "! I won't take anything from you.");
        return;
    } else if(userChoice == "rock") {
        if(botChoice == "scissors") {
            database.users.findById(message.userId).then(user => {
                user.balance += coins;
                user.save().then(() => {
                    api.say("I chose " + botChoice + ". I guess you win, " + message.username + ". Here's " + coins + " coins.");
                });
            });

            return;
        }
    } else if(userChoice == "paper") {
        if(botChoice == "rock") {
            database.users.findById(message.userId).then(user => {
                user.balance += coins;
                user.save().then(() => {
                    api.say("I chose " + botChoice + ". I guess you win, " + message.username + ". Here's " + coins + " coins.");
                });
            });

            return;
        }
    } else if(userChoice == "scissors") {
        if(botChoice == "paper") {
            database.users.findById(message.userId).then(user => {
                user.balance += coins;
                user.save().then(() => {
                    api.say("I chose " + botChoice + ". I guess you win, " + message.username + ". Here's " + coins + " coins.");
                });
            });

            return;
        }
    }

    database.users.findById(message.userId).then(user => {
        user.balance -= coins;
        user.save().then(() => {
            api.say("I chose " + botChoice + ". I win! Thanks for " + coins + " coins " + message.username + "!");
        });
    });
};
