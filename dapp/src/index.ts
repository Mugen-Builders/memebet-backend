import { createApp } from "@deroll/app";
import { createWallet } from "@deroll/wallet";
import advanceHandlers from "./advance";
import AppManager from "./AppManager";
import inspectHandlers from "./inspect";
import Governance from "./Governance";
import { ValidatorManager } from "./validator";

const ROLLUP_SERVER = process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:8080/rollup";
//@DEV this needs to be set before deployment to correct key
const INITIAL_DAO_MEMBER = process.env.INITIAL_DAO_MEMBER || "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"

const app = createApp({ url: ROLLUP_SERVER });


const appManager = AppManager.getInstance();
let wallet = appManager.getWallet();
const governance = new Governance([INITIAL_DAO_MEMBER]);
const validatorManager = ValidatorManager.getInstance();

advanceHandlers(app, wallet , appManager, governance, validatorManager);
const router = inspectHandlers(app, wallet, appManager, governance);
app.addInspectHandler(router.handler);
app.start().catch((error) => {
    console.error("Failed to start the application:", error);
    process.exit(1);
});
