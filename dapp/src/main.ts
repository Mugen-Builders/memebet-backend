import { createApp } from "@deroll/app";
import { createWallet } from "@deroll/wallet";
import advanceHandlers from "./advance"; 
import AppManager from "./AppManager";
import inspectHandlers from "./inspect";
import Governance from "./Governance";

const ROLLUP_SERVER = process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:8080/rollup";

const app = createApp({ url: ROLLUP_SERVER });
const wallet = createWallet();

const appManager = AppManager.getInstance();
const governanceWallets = Governance.getInstance();

advanceHandlers(app, wallet, appManager, governanceWallets);
const router = inspectHandlers(app, wallet, appManager);
app.addInspectHandler(router.handler);
app.start().catch((error) => {
    console.error("Failed to start the application:", error);
    process.exit(1);
});
