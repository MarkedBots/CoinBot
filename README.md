
# About CoinBot
CoinBot is a simple, usable addon built for ChatBot CE. It allows your users to earn coins by being in your chat. It also provides a simple set of commands to get you started. We really built it to show you that you're addons are only limited by your coding ability.

---

# Commands
## General
### Balance - `balance`
#### About
Check the balance of your account.

#### Example
`!balance`

## Gambling
### Guess the Number - `guessthenumber` / `gtn`
#### About
GTN has to be one of the most addicting features in CoinBot. It's simple...you give up some coins and guess a number.

#### Example
`!gtn 100 5` - Give up 100 coins and guess the answer 5.
`!gtn 512 100 200` - Give up 512 coins and guess the answer is 100 with a return percentage of 200%.

#### Parameters
```
gtn {coins} {answer} {return percentage?}
```

|        Name       	|       Type       	|                      Description                      	| Required 	| Requirements 	|
|:-----------------:	|:----------------:	|:-----------------------------------------------------:	|:--------:	|:------------:	|
| Coins             	| Number (Integer) 	| The amount of coins that the user is willing to lose. 	|    Yes   	|     >=5     	|
| Answer            	| Number (Integer) 	| The guess.                                            	|    Yes   	|     >= 0     	|
| Return Percentage 	| Number (Integer) 	| Check return percentage section.                      	|    No    	|     >= 1     	|

#### Return Percentage
The return percentage [RP] is a huge thing in GTN.  It modifies how the entire game is played. By default the RP is set at 50%. So if you give 100 coins, you can get 50 coins back. If the RP is set, it changes that...but here's the game changing portion. The higher the RP, the bigger the range of numbers is. Check *Number Range* for more info on how number ranges work.

#### Number Range
The number range [NR] is how the addon calculates the answers. By default the *Return Percentage [RP]* is 50%. The NR is calculated by dividing the RP by 2 and ensuring it's rounded down to the nearest whole number. So by default the number range is 0 to 25. If you set the RP to 100%, then it's 0 to 50. A non-whole number example would be 75%. If your RP is set to 75% (75/2=37.5) then the NR will be 0 to 37.

### Rock, Paper, Scissors - `rps`
#### About
A simple game of rock, paper, scissors...but for coins.

#### Example
`!rps 100 rock` - Give up 100 coins and throw rock.

#### Parameters
```
rps {coins} {choice}
```

|  Name  	|              Type              	|                      Description                      	| Required 	|          Requirements         	|
|:------:	|:------------------------------:	|:-----------------------------------------------------:	|:--------:	|:-----------------------------:	|
| Coins  	|        Number (Integer)        	| The amount of coins that the user is willing to lose. 	|    Yes   	|              >=10             	|
| Choice 	| String [rock, paper, scissors] 	| Your choice for the computer to beat.                 	|    Yes   	| Must be rock, paper, scissors 	|
