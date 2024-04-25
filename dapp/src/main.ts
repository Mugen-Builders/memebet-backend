import { createApp } from "@deroll/app";
import { createRouter } from "@deroll/router";
import { createWallet } from "@deroll/wallet";

// create app
const app = createApp({ url: "http://localhost:8080/rollups" });

// create wallet
const wallet = createWallet();

const router = createRouter({ app });
router.add<{ address: string }>(
    "wallet/:address",
    ({ params: { address } }) => {
        return JSON.stringify({
            balance: wallet.etherBalanceOf(address),
        });
    },
);

app.addAdvanceHandler(wallet.handler);
app.addInspectHandler(router.handler);

// start app
app.start().catch((e) => {
    console.log(e);
    process.exit(1)
});

