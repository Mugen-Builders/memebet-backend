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
import { Hex } from "viem";

export default (app: App, wallet: WalletApp , appManager: AppManager, governance:Governance) => {
  const router = createRouter({ app });

  router.add<{ sender: string }>(
    "wallet/ether/:sender",
    ({ params: { sender } }) => {
      return JSON.stringify({
        balance: `${wallet.etherBalanceOf(sender).toString()} wei`,
      });
    }
  );

  router.add<{ token: Hex; sender: string }>(
    "wallet/erc20/:token/:sender",
    ({ params: { token, sender } }) => {
      return JSON.stringify({
        balance: `${wallet.erc20BalanceOf(token, sender).toString()}`,
      });
    }
  );

  gamesRoutes.register({app, wallet, router, appManager, governance});
  governanceRoutes.register({app, wallet, router, appManager, governance});

  return router;
};
