
import { App } from "@deroll/core";
import { WalletApp } from "@deroll/wallet";
import  AppManager from "../AppManager";
import Game from '../Game';
import { decodeFunctionData, parseAbi } from "viem";

import { AdvanceRequestData, RequestHandlerResult } from "../types";

import * as walletHandlers from "./wallet";
import * as betHandlers from "./game";
import * as governanceHandlers from "./governance";
import Governance from "../Governance";

const games = new Map<string, Game>();

export type BasicArgs = {
    inputArgs: any;
    app: App;
    wallet: WalletApp;
    metadata: AdvanceRequestData["metadata"];
    appManager: AppManager;
    governance: Governance
};


export type HandlerFunction = (args: BasicArgs) => Promise<RequestHandlerResult>;
type Handlers = { [key in string]: HandlerFunction };

const handlers: Handlers = {
    ...betHandlers.handlers,
    ...walletHandlers.handlers,
    ...governanceHandlers.handlers,
};
const abi = parseAbi([...betHandlers.abi, ...walletHandlers.abi, ...governanceHandlers.abi]);

export default async (app: App, wallet: WalletApp, appManager: AppManager, governance: Governance) => {
    walletHandlers.addTokensDepositHandler(app, wallet);
    app.addAdvanceHandler(async ({ payload, metadata }: AdvanceRequestData) => {
        try {
            const { functionName, args } = decodeFunctionData({ abi, data: payload });
            const handler = handlers[functionName as string];
            if (!handler) {
                console.warn(`No handler found for function: ${functionName}`);
                return "reject";
            }
            return handler({ inputArgs: args, app, wallet, metadata, appManager, governance });
        } catch (error) {
            console.error("Error processing command:", error);
            return "reject";
        }
    });

};
