import { App } from "@deroll/core";
import { WalletApp } from "@deroll/wallet";
import { createRouter, Router } from "@deroll/router";
import { BetsManager, Game } from "../bets";

//@TODO this needs to be removed in favor of GameManager instance
const games = new Map<string, Game>();
export type InspectHandlerInput = {
  app: App;
  wallet: WalletApp;
  router: Router;
  games: Map<string, Game>;
};
export type InspectHandlers = (args:InspectHandlerInput) => void;

import * as _games from "./games"; //@refactor this when done with GameManager

export default (app: App, wallet: WalletApp , betsManager: BetsManager) => {
  const router = createRouter({ app });

  router.add<{ address: string }>(
    "wallet/:address",
    ({ params: { address } }) => {
      return JSON.stringify({
        etherBalance: wallet.etherBalanceOf(address),
      });
    }
  );

  _games.register({app, wallet, router, games});

  return router;
};
