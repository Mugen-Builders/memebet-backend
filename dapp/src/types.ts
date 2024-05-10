
import { Hex }  from "viem";
import { components } from "./schema";


export type AdvanceRequestData = components["schemas"]["Advance"];
export type InspectRequestData = components["schemas"]["Inspect"];
export type RequestHandlerResult = components["schemas"]["Finish"]["status"];
export type RollupsRequest = components["schemas"]["RollupRequest"];
export type InspectRequestHandler = (data: InspectRequestData) => Promise<void>;
export type AdvanceRequestHandler = (
  data: AdvanceRequestData
) => Promise<RequestHandlerResult>;


export type Bet = {
    pick: string
    player:string
    tokenAddress: string
    amount: bigint
    effectiveAmount?: bigint
    odds?: number
}

export type VFR = (picksBets: Map<string, Bet[]>, data: string, signature: Hex) => Promise<string>;

export type PlayerBet = Map<string, Array<Bet>>;

