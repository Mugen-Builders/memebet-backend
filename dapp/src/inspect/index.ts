import { App } from "@deroll/core";
import { WalletApp } from "@deroll/wallet";
import { createRouter, Router } from "@deroll/router";
import AppManager from "../AppManager";
import Governance from "../Governance";


export type InspectHandlerInput = {
  app: App;
  wallet: WalletApp;
  router: Router;
  appManager: AppManager;
  governance: Governance;
};

export type InspectHandlers = (args:InspectHandlerInput) => void;

import * as gamesRoutes from "./games";
import * as governanceRoutes from "./governance";

export default (app: App, wallet: WalletApp , appManager: AppManager, governance:Governance) => {
  const router = createRouter({ app });

  router.add<{ address: string }>(
    "wallet/:address",
    ({ params: { address } }) => {
      return JSON.stringify({
        etherBalance: wallet.etherBalanceOf(address),
      });
    }
  );
  gamesRoutes.register({app, wallet, router, appManager, governance});
  governanceRoutes.register({app, wallet, router, appManager, governance});

  return router;
};
