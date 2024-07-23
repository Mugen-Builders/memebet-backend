import { createApp } from "@deroll/app";
import { createWallet } from "@deroll/wallet";
import advanceHandlers from "./advance";
import AppManager from "./AppManager";
import inspectHandlers from "./inspect";
import Governance from "./Governance";
import { ValidatorManager } from "./validator";

const ROLLUP_SERVER = process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:5004";
//@DEV this needs to be set before deployment to correct key
const INITIAL_DAO_MEMBER = process.env.INITIAL_DAO_MEMBER || "0x3a146915527bd1528026b5c14335098dff2700ca"

const app = createApp({ url: ROLLUP_SERVER });


const appManager = AppManager.getInstance();
let wallet = appManager.getWallet();
const governance = new Governance([INITIAL_DAO_MEMBER]);
const validatorManager = ValidatorManager.getInstance();

advanceHandlers(app, wallet , appManager, governance, validatorManager);
const router = inspectHandlers(app, wallet, appManager, governance, validatorManager);
app.addInspectHandler(router.handler);
start();


export function start() {
    app.start().catch((error) => {
        console.error("Failed to start the application:", error);
        process.exit(1);
    });    
}

