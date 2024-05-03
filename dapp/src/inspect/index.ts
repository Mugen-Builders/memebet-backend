import { App } from "@deroll/core";
import { WalletApp } from "@deroll/wallet";
import { createRouter, Router } from "@deroll/router";
import AppManager from "../AppManager";
import Game from "../Game";



export type InspectHandlerInput = {
  app: App;
  wallet: WalletApp;
  router: Router;
  games: Map<string, Game>;
};
export type InspectHandlers = (args:InspectHandlerInput) => void;

import * as _games from "./games"; //@refactor this when done with GameManager

export default (app: App, wallet: WalletApp , appManager: AppManager) => {
  const router = createRouter({ app });

  router.add<{ address: string }>(
    "wallet/:address",
    ({ params: { address } }) => {
      return JSON.stringify({
        etherBalance: wallet.etherBalanceOf(address),
      });
    }
  );
  // @todo fix with AppManager
  _games.register({app, wallet, router, games});

  return router;
};
