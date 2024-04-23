import { Bet, VFR, PlayerBet } from "./types";

// Controls the funds for a bet
// it handles the betting and settling of funds
// it should communicate directly to deroll-wallet and
// create a custom local-only address
export class BetPool {

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


interface game {
    id: string
    playersBets: any
    fees: number
    startTime: number
    endTime: number
    getPlayer(...args: any[]): any
    makeBet(...args: any[]): any
    settle(...args: any[]): any
}


export class Games implements game {
    id: string
    picks: Array<string>;
    currentOdds: Map<string, bigint>
    playerIds: Array<string>;
    playersBets: Map<string, PlayerBet>;
    picksBets: Map<string, Bet[]>;
    fees: number;
    startTime: number;
    endTime: number;
    verifyFun: VFR

    constructor(_picks: Array<string>, start: number, end: number, verifyFun: VFR) {
        this.id = ""
        this.playersBets = new Map();
        this.picksBets = new Map();
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
        this.picksBets.get(_bet.pick)?.push(_bet);
        //@todo odds calculation and update
    }
    settle = (_picks: Map<string, Map<string, Bet[]>>, _bets: Bet[], _data: any) => {
        const res = this.verifyFun(_picks, _bets, _data);
    }
}




