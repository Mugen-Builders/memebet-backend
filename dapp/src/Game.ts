import { Hex, getAddress } from "viem";
import { Bet, VFR, PlayerBet } from "./types";
import { ValidatorFunctionRunner } from "./validator";
import { WalletApp } from "@deroll/wallet";
import { v4 as uuidv4 } from 'uuid';
import BetPool from "./BetPool";

export default class Game {
    getInfo(): any {
        //TO-DO
        throw new Error("Method not implemented.");
    }
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
    constructor(_picks: Array<string>, start: number, end: number, tokenAddress: Hex, verifyFun: ValidatorFunctionRunner, _wallet: WalletApp) {
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
        this.betPool = new BetPool(_picks, tokenAddress, _wallet);
    }
    getPlayer = (player: string) => {
        return { player: player, Bet: this.playersBets.get(player) }
    }
    makeBet = (_bet: Bet) => {
        let playerBets = this.playersBets.get(_bet.player);
        if (!playerBets) {
            // Initialize the new map for picks if this player hasn't placed any bets yet
            playerBets = new Map();
            this.playersBets.set(_bet.player, playerBets);
        }

        // Get the array of bets for the specific pick
        let bets = playerBets.get(_bet.pick);
        if (!bets) {
            // Initialize it as an array if it's the first bet for this pick
            bets = [];
            playerBets.set(_bet.pick, bets);
        }
        bets.push(_bet); // Add the bet to the array

        this.betPool.addBet(_bet); // Add bet to the pool
    };


    async settle(_data: string, signature: Hex) {
        try {
            const winningPick = await this.verifyFun.run(this.betPool.picksBets, _data, signature);
            if (!this.picks.includes(winningPick)) {
                console.log("Invalid pick or draw");
                this.betPool.payout("invalid");
            } else {
                this.betPool.payout("win", [winningPick]);
            }
        } catch (error) {
            console.error(`Error during settlement: ${error}`);
        } finally {
            await this.betPool.close();
        }
    }



}