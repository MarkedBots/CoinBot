module.exports = (database, api) => {
    const admin = {};

    admin.give = (parameters, message) => {
        let coins = Number(parameters[0]);
        let requestedUser = parameters[1];

        if(coins === NaN) {
            api.say(message.username + ", the request coins '" + parameters[0]  + "' is not valid.");
            return;
        }

        if(coins < 1) {
            api.say(message.username + ", I can not give 0 (or less than that) coins.");
            return;
        }

        database.users.findOne({
            where: {
                name: requestedUser
            }
        }).then(user => {
            if(user == null) {
                api.say(message.username + ", the user '" + requestedUser + "' does not exist in my database.");
                return;
            }

            user.balance += coins;
            user.save().then(() => {
                api.say("@" + requestedUser + " just got " + coins + " more coins from " + message.username + "! Nice.");

                return;
            });
        })
     }

    return admin;
};
