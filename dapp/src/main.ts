import { createApp } from "@deroll/app";

import { createWallet } from "@deroll/wallet";


import advanceHandlers from "./advance"; 
import inspectHandlers from "./inspect";
const app = createApp({ url: "http://localhost:8080/rollups" });
const wallet = createWallet();

//@TODO create GameManager instance here and pass it down to all handlers

advanceHandlers(app, wallet);
const router = inspectHandlers(app, wallet);
app.addInspectHandler(router.handler);

app.start().catch((error) => {
    console.error("Failed to start the application:", error);
    process.exit(1);
});
