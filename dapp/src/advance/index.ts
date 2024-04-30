
import { App } from "@deroll/core";
import { WalletApp } from "@deroll/wallet";
import { Game, BetPool, BetsManager } from "../bets";
import { decodeFunctionData, parseAbi } from "viem"; 

import { AdvanceRequestData, RequestHandlerResult } from "../types";

import * as wallet from "./wallet";

//@TODO this needs to be refactored and become just GameFactory
const games = new Map<string, Game>();

export type BasicArgs = {
    inputArgs: any;
    app: App;
    wallet: WalletApp;
    metadata: AdvanceRequestData["metadata"];
    betsManager: BetsManager;
  };
  

type HandlerFunction = (args:BasicArgs) => Promise<RequestHandlerResult>;
type Handlers = { [key in string]: HandlerFunction };

const handlers = { ...wallet.handlers } as Handlers;
const abi = [...wallet.abi];

export default async (app: App, wallet: WalletApp, betsManager: BetsManager) => {
    // Handling incoming blockchain commands
    app.addAdvanceHandler(async ({ payload, metadata }: AdvanceRequestData) => {
        try {
            const { functionName, args } = decodeFunctionData({ abi, data: payload });
    
            const handler = handlers[functionName as string];

            if(handler) {
                return handler({inputArgs:args, app, wallet, metadata, betsManager});
            } 
            return "reject";
        } catch (error) {
            console.error("Error processing command:", error);
            return "reject";
        }
    });

};
