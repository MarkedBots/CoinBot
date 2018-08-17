let semver = require("semver");
let compare = require("semver-compare");
let axios = require("axios");
let fs = require("fs");

let cointbotPackage = JSON.parse(fs.readFileSync(require.resolve("../../package.json"), "utf8"));

export = (log: any) => {
    axios("https://api.github.com/repos/MarkedBots/CoinBot/releases/latest?callback")
        .then((response: any) => {
            let ghVersion = semver.clean(response.data.tag_name);
            let cbVersion = semver.clean(cointbotPackage.version);

            if (compare(ghVersion, cbVersion) > 0) {
                log.warn(`You're on v${cbVersion}. There is an update available (v${ghVersion}). Please update as soon as possible.`);
            } else {
                log.info("You're on the latest version.");
            }
        }).catch((error: any) => {
            log.error(error);
        });
};