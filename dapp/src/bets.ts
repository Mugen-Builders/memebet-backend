import { Hex, getAddress } from "viem";
import { Bet, VFR, PlayerBet } from "./types";
import { ValidatorFunctionRunner } from "./validator";
import { WalletApp } from "@deroll/wallet";
import { v4 as uuidv4 } from 'uuid';
// Controls the funds for a bet
// it handles the betting and settling of funds
// it should communicate directly to deroll-wallet and
// create a custom local-only address
const ERC20_TOKEN = "0xf795b3D15D47ac1c61BEf4Cc6469EBb2454C6a9b"; //this is the sunodo token a sample erc20 token
const POOL_ADDRESS = "0x01"; //this is a sample address for bet pool
const DAO_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; //this is a sample address for the DAO
export class BetPool {
    poolAddress: string
    fundsLocked = BigInt(0)
    picksBets: Map<string, Bet[]>;
    effectiveBets: Map<string, bigint>; //this is a map of the amount bet on each pick at any point of time which will help us calculate the effective bet amount of a player
    wallet: WalletApp
    constructor(picks: Array<string>, _wallet: WalletApp) {
        this.poolAddress = "0x01";
        this.picksBets = new Map();
        picks.forEach((pick) => {
            this.picksBets.set(pick, []);
        });
        this.wallet = _wallet;
        this.effectiveBets = new Map();
    }

    addBet(bet: Bet) {
        // transfer the funds to the pool
        // @TODO wallet integration

        this.fundsLocked += bet.amount;
        this.wallet.transferERC20(getAddress(ERC20_TOKEN), bet.player, POOL_ADDRESS, bet.amount);
        const [newBet, _effectiveBet] = this.calculateEffectiveAmount(bet);
        this.picksBets.get(bet.pick)?.push(newBet);
        this.effectiveBets.set(bet.pick, _effectiveBet);
    }

    //This function adds a simple algorithm to calculate the effective amount a player will win after placing a bet at any point in time.
    //More logic can be added to this depending on different scenarios.
    calculateEffectiveAmount(bet: Bet): [Bet, bigint] {
        const _effectiveBet = this.effectiveBets.get(bet.pick)??BigInt(0) + bet.amount;
        let _effective_amount = bet.amount;
        if (_effectiveBet) {
            _effective_amount = bet.amount + (bet.amount / _effectiveBet) * (this.fundsLocked - _effectiveBet);
        }
        bet.effectiveAmount = _effective_amount;
        return [bet, _effectiveBet];
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
            const amount = b[key] ?? BigInt(0);
            total += amount;
            this.wallet.transferERC20(getAddress(ERC20_TOKEN), POOL_ADDRESS, b.player, amount);

        })
        this.fundsLocked -= total;
    }

    // sends any outstanding funds to the DAO wallet
    close() {
        // @TODO wallet integration
        // @TODO define default DAO wallet
        if (this.fundsLocked > BigInt(0)) {
            // send funds to DAO
            this.wallet.transferERC20(getAddress(ERC20_TOKEN), POOL_ADDRESS, DAO_ADDRESS, this.fundsLocked);
        }

        // delete poolx wallet from the wallet integration /*this may not be possible with the functions exposed from deroll but we are anyways initializing new wallet for each game"
        // @TODO 
    }
}


// Higher level manager for all things bet
// Handles the creation and listing of new models
// Handles the creation and listing of new games
export abstract class BetsManager {
    gameTypes: Map<string, any> //we might need a game interface here
    gameSessions: Map<string, any>
    GFM: GameFactoryManager

    constructor() {
        this.gameTypes = new Map();
        this.gameSessions = new Map();
        this.GFM = new GameFactoryManager();
    }




    createNewGameType(...args: any[]) { //only DAO
        this.gameTypes.set(args[0], new Game(args[1], args[2], args[3], args[4], args[5]));
    }

    createNewGame(_type: any) {

        const factoryInstance = <Game>this.gameTypes.get(_type);
        if (factoryInstance) {
            //@To-do create a new game
        } else {
            console.log(`game type:${_type} not supported by the platform make a proposal to our dao to add this game type`);
            return
        } // teams, dates, championshi

    }
}



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
    wallet: WalletApp
    constructor(_picks: Array<string>, start: number, end: number, verifyFun: ValidatorFunctionRunner, _wallet: WalletApp) {
        this.id = uuidv4();
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
        this.wallet = _wallet
        this.betPool = new BetPool(_picks, _wallet);
    }
    getPlayer = (player: string) => {
        return { player: player, Bet: this.playersBets.get(player) }
    }
    calculateOdds = () => {
        //added this logic into the bet pool 
        //can be removed
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




