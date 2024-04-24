import { Hex } from "viem";
import { Bet, VFR, PlayerBet } from "./types";
import { ValidatorFunctionRunner } from "./validator";

// Controls the funds for a bet
// it handles the betting and settling of funds
// it should communicate directly to deroll-wallet and
// create a custom local-only address
export class BetPool {
    poolAddress: string
    fundsLocked = BigInt(0)
    picksBets: Map<string, Bet[]>;

    constructor(picks: Array<string>) {
        this.poolAddress = "0x01";
        this.picksBets = new Map();
        picks.forEach((pick) => {
            this.picksBets.set(pick, []);
        });
    }

    addBet(bet: Bet) {
        // transfer the funds to the pool
        // @TODO wallet integration
        this.picksBets.get(bet.pick)?.push(bet);
        this.fundsLocked += bet.amount;
    }

    payout(mode: "win" | "invalid", winningPicks?: Array<string>) {
        if (mode === "win") {
            winningPicks!.forEach((pick) => {
                this.picksBets.get(pick)?.forEach((b) => {
                    this.resdistribution(this.picksBets.get(pick)!, "effectiveAmount");
                });
            });
        } else { // invalid will return the original amount
            this.picksBets.forEach((bets) => {
                this.resdistribution(bets, "amount");
            });
        }
    }
    // allows for internal redistribution of values based on bets
    // it can use the winning value (effectiveAmount)
    // OR it can use the original value for reset/invalidation
    private resdistribution(bets: Array<Bet>, key: "amount" | "effectiveAmount") {
        let total = BigInt(0);
        bets.forEach((b) => {
            total += b[key] ?? BigInt(0);
        })
        this.fundsLocked -= total;
    }

    // sends any outstanding funds to the DAO wallet
    close() {
        // @TODO wallet integration
        // @TODO define default DAO wallet
        if(this.fundsLocked > BigInt(0)) {
            // send funds to DAO
        }
        // delete pool wallet from the wallet integration
        // @TODO 
    }
}

// Manages a betting session/game
// After approving a new GameFactoryManager, we have a factory of bet games
//  ie: GameFactoryManager.create(Soccer games instructions) --> soccerInstanceFactory
//      soccerInstanceFactory.create(BR VS Italy) --> new bet game
//  This will be used to establish the new types of bets and categories (soccer, CSGO, coinflip...)
// export class GameFactoryManager {
//     Games: Map<string, any>
//     constructor() {
//         this.Games = new Map();
//     }
//     newFactory(...args) {
//         return new GameFactory(..args);
//     }
//     createNewFactory(name: string) {
//         const factory = this.Games.get(name);

//         return new factory();
//     }
// }
// Manages the creation of game instaces
// A factory knows the rules, the validator function
// export class GameFactory {

// }
// Higher level manager for all things bet
// Handles the creation and listing of new models
// Handles the creation and listing of new games
// export class BetsManager {
//     gameTypes: Map<string, any>
//     gameSessions: Map<string, any>

//     constructor() {
//         this.gameTypes = new Map();
//         this.gameSessions = new Map();
//     }

//     createNewGameType(...args: any[]) { //only DAO
//         this.gameTypes.push(GameFactoryManager.newFactory(args));

//     }

//     createNewGame(_type: any) {
//         if (_type === "soccer") {
//             factoryInstance = this.gameTypes[1];
//             gameSessions.push(factoryInstace.newGame(...args)); // teams, dates, championshi
//         }
//     }
// }



export class Game {
    id: string
    picks: Array<string>;
    currentOdds: Map<string, bigint>
    playerIds: Array<string>;
    playersBets: Map<string, PlayerBet>;
    
    fees: number;
    startTime: number;
    endTime: number;
    verifyFun: ValidatorFunctionRunner

    betPool: BetPool

    constructor(_picks: Array<string>, start: number, end: number, verifyFun: ValidatorFunctionRunner) {
        this.id = "@TODO generate id"
        this.playersBets = new Map();
        this.picks = _picks;
        this.currentOdds = new Map();
        this.picks.forEach((e) => {
            this.currentOdds.set(e, BigInt(0));
        })
        this.fees = 2;
        this.startTime = start;
        this.endTime = end;
        this.playerIds = [];
        this.verifyFun = verifyFun;
        this.betPool = new BetPool(_picks);
    }
    getPlayer = (player: string) => {
        return { player: player, Bet: this.playersBets.get(player) }
    }
    calculateOdds = () => {

    }
    makeBet = (_bet: Bet) => {
        let player = this.playersBets.get(_bet.player);
        if (player == undefined) {
            this.playerIds.push(_bet.player);
            player = new Map();
            player.set(_bet.player, [_bet]);
            this.playersBets.set(_bet.player, player);

        } else {
            let bet = player.get(_bet.pick);
            bet?.push(_bet);
            this.playersBets.set(_bet.player, player);
        }
        this.betPool.addBet(_bet);
        //@todo odds calculation and update
    }
    settle = async (_data: string, signature: Hex) => {
        const winningPick = await this.verifyFun.run(this.betPool.picksBets, _data, signature);
        //@TODO extra logic for multiple winning picks
        if (!this.picks.includes(winningPick)) {
            console.log("Invalid pick or draw");
            this.betPool.payout("invalid");
        } else {
            this.betPool.payout("win", [winningPick]);
        }
        this.betPool.close();
    }


}




