let bluebird = require("bluebird");
let crypto = bluebird.promisifyAll(require("crypto"));
let cryptoSync = require("crypto");

export class Crypto {
    public static randomNumber(minimum: number, maximum: number): number {
        let range = maximum - minimum;

        if (range >= Math.pow(2, 32)) {
            return 0;
        }

        let tmp = range;
        let bitsNeeded = 0;
        let bytesNeeded = 0;
        let mask = 1;

        while (tmp > 0) {
            if (bitsNeeded % 8 === 0) {
                bytesNeeded += 1;
            }
            
            bitsNeeded += 1;
            mask = mask << 1 | 1;
            tmp = tmp >>> 1;
        }
        
        let randomBytes = cryptoSync.randomBytes(bytesNeeded);
        let randomValue = 0;

        for (let i = 0; i < bytesNeeded; i++) {
            randomValue |= randomBytes[i] << 8 * i;
        }

        randomValue = randomValue & mask;

        if (randomValue <= range) {
            return minimum + randomValue;
        } else {
            return this.randomNumber(minimum, maximum);
        }
    }

    public static randomNumberAsync(minimum: number, maximum: number): Promise<any> {
        return bluebird.try(() => {
           return this.secureRandomNumber(minimum, maximum);
        });
    }

    public static calculateParameters(range: any): any {
        let bitsNeeded = 0;
        let bytesNeeded = 0;
        let mask = 1;
        
        while (range > 0) {
            if (bitsNeeded % 8 === 0) {
                bytesNeeded += 1;
            }
            
            bitsNeeded += 1;
            mask = mask << 1 | 1;
            range = range >>> 1; 
        }
        
        return {bitsNeeded, bytesNeeded, mask};
    }

    public static secureRandomNumber(minimum: number, maximum: number, cb?: any): any {
        return bluebird.try(() => {
            if (crypto === null || crypto.randomBytesAsync === null) {
                throw new Error("No suitable random number generator available. Ensure that your runtime is linked against OpenSSL (or an equivalent) correctly.");
            }

            if (minimum === null) {
                throw new Error("You must specify a minimum value.");
            }
            
            if (maximum === null) {
                throw new Error("You must specify a maximum value.");
            }
            
            if (minimum % 1 !== 0) {
                throw new Error("The minimum value must be an integer.");
            }
            
            if (maximum % 1 !== 0) {
                throw new Error("The maximum value must be an integer.");
            }
            
            if (!(maximum > minimum)) {
                throw new Error("The maximum value must be higher than the minimum value.");
            }

            if (minimum < -9007199254740991 || minimum > 9007199254740991) {
                throw new Error("The minimum value must be inbetween MIN_SAFE_INTEGER and MAX_SAFE_INTEGER.");
            }
            
            if (maximum < -9007199254740991 || maximum > 9007199254740991) {
                throw new Error("The maximum value must be inbetween MIN_SAFE_INTEGER and MAX_SAFE_INTEGER.");
            }
            
            let range = maximum - minimum;
            
            if (range < -9007199254740991 || range > 9007199254740991) {
                throw new Error("The range between the minimum and maximum value must be inbetween MIN_SAFE_INTEGER and MAX_SAFE_INTEGER.");
            }

            let {bitsNeeded, bytesNeeded, mask} = this.calculateParameters(range);
		
            return bluebird.try(() => {
                return crypto.randomBytesAsync(bytesNeeded);
            }).then((randomBytes: any) => {
                var randomValue = 0;

                for (let i = 0; i < bytesNeeded; i++) {
                    randomValue |= (randomBytes[i] << (8 * i));
                }
                
                randomValue = randomValue & mask;
                
                if (randomValue <= range) {
                    return minimum + randomValue;
                } else {
                    return this.secureRandomNumber(minimum, maximum);
                }
            });
        }).nodeify(cb);
    }
}