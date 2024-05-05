import { Hex, getAddress, toHex} from "viem";
import { Bet, VFR, PlayerBet } from "./types";
import { ValidatorFunctionRunner } from "./validator";
import { WalletApp } from "@deroll/wallet";
import { v4 as uuidv4 } from 'uuid';

// const ERC20_TOKEN = "0xf795b3D15D47ac1c61BEf4Cc6469EBb2454C6a9b"; //this is the sunodo token a sample erc20 token
const DAO_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; //this is a sample address for the DAO


let POOL_ADDRESS = 0; // base address for the pools
// creates a address for each pool in a safe range
// avoiding collision
const getPoolAddress = ():Hex => {
    POOL_ADDRESS++;
    return toHex(POOL_ADDRESS);
}

export const resetPoolAddress = () => {
    POOL_ADDRESS = 0;
};

// Controls the funds for a bet
// it handles the betting and settling of funds
// and communicates directly to deroll-wallet and
// it uses a custom, local-only address
export default class BetPool {
    poolAddress: string
    tokenAddress: string; //this is the address of the token being used for the pool
    fundsLocked = BigInt(0)
    picksBets: Map<string, Bet[]>;
    effectiveBets: Map<string, bigint>; //this is a map of the amount bet on each pick at any point of time which will help us calculate the effective bet amount of a player
    wallet: WalletApp
    
    constructor(picks: Array<string>, tokenAddress: Hex, _wallet: WalletApp) {
        this.poolAddress = getPoolAddress();
        this.picksBets = new Map();
        picks.forEach((pick) => {
            this.picksBets.set(pick, []);
        });
        this.wallet = _wallet;
        this.effectiveBets = new Map();
        this.tokenAddress = tokenAddress;
    }

    addBet(bet: Bet) {
        // transfer the funds to the pool
        this.fundsLocked += bet.amount;
        this.wallet.transferERC20(getAddress(bet.tokenAddress), bet.player, this.poolAddress, bet.amount);
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
            this.wallet.transferERC20(getAddress(b.tokenAddress), this.poolAddress, b.player, amount);

        })
        this.fundsLocked -= total;
    }

    async transferFunds(token: string, from: string, to: string, amount: bigint) {
        try {
            await this.wallet.transferERC20(getAddress(token), from, to, amount);
        } catch (error) {
            console.error(`Error transferring funds: ${error}`);
            throw new Error('Fund transfer failed');
        }
    }

    // sends any outstanding funds to the DAO wallet
    async close() {
        if (this.fundsLocked > BigInt(0)) {
            try {
                await this.transferFunds(this.tokenAddress, this.poolAddress, DAO_ADDRESS, this.fundsLocked);
                this.fundsLocked = BigInt(0); 
            } catch (error) {
                console.error('Failed to transfer funds to DAO, keeping funds locked.');
            }
        }
    }
}






