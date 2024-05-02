
import { App } from "@deroll/core";
import { WalletApp } from "@deroll/wallet";
import { Game, BetsManager } from "../bets";
import { decodeFunctionData, toHex } from "viem"; 

import { AdvanceRequestData, RequestHandlerResult } from "../types";

import * as walletHandlers from "./wallet";
import * as betHandlers from "./game";

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

const handlers: Handlers = {
    ...betHandlers.handlers,
    ...walletHandlers.handlers
};
const abi = [...betHandlers.abi];

export default async (app: App, wallet: WalletApp, betsManager: BetsManager) => {
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
