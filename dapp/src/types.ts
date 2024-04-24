import { Hex }  from "viem";

export type Bet = {
    pick: string
    player:string
    tokenAddress: string
    amount: bigint
    effectiveAmount?: bigint
    odds?: number
}
export type PlayerBet = Map<string, Array<Bet>>;

export type VFR = (picksBets: Map<string, Bet[]>, bets: Array<Bet>, data: string, signature: Hex) => Promise<string>;
