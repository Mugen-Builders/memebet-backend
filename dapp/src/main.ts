import { createApp } from "@deroll/app";

import { createWallet } from "@deroll/wallet";


import advanceHandlers from "./advance"; 
import { BetsManager } from "./bets";
import inspectHandlers from "./inspect";
const app = createApp({ url: "http://localhost:8080/rollups" });
const wallet = createWallet();

const betsManager = BetsManager.getInstance();

advanceHandlers(app, wallet, betsManager);
const router = inspectHandlers(app, wallet, betsManager);
app.addInspectHandler(router.handler);

app.start().catch((error) => {
    console.error("Failed to start the application:", error);
    process.exit(1);
});
