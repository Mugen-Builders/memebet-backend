import { createApp } from "@deroll/app";
import { createRouter } from "@deroll/router";
import { createWallet } from "@deroll/wallet";
import { Game } from "./bets"; // Custom classes for betting logic

const app = createApp({ url: "http://localhost:8080/rollups" });
const wallet =  createWallet();


const games = new Map<string, Game>();

// Router to handle HTTP-like requests
const router = createRouter({ app });

// Define betting and wallet interaction ABI
// const abi = parseAbi([
//     "function createGame(string, string[], uint, uint)",
//     "function placeBet(string, string, uint256)",
// ]);

// Handling incoming blockchain commands
app.addAdvanceHandler(async ({ payload }) => {
    const hexString = payload.replace(/^0x/, '');
    const buffer = Buffer.from(hexString, "hex");

    // Convert the buffer to a UTF-8 string
    const utf8String = buffer.toString("utf8");
    console.log(utf8String);
    return Promise.resolve("accept");
});

app.addAdvanceHandler(async ({ payload }) => {
    try {
        const hexString = payload.replace(/^0x/, '');
        const buffer = Buffer.from(hexString, "hex");

        const utf8String = buffer.toString("utf8");
        console.log(utf8String);
        const inputData = JSON.parse(utf8String);

        switch (inputData.functionName) {
            case "createGame":
                const { id, picks, start, end } = inputData;
                if (games.has(id)) return Promise.resolve("accept");
                // const newGame = new Game(picks, start, end, wallet, new BetPool(picks, wallet));
                // games.set(id, newGame);
                return Promise.resolve("accept");
            case "placeBet":
                const { gameid, player, pick, amount } = inputData;
                const game = games.get(gameid);
                if (!game) return Promise.resolve("reject");
                game.makeBet({
                    pick,
                    player,
                    amount: BigInt(amount),
                    effectiveAmount: BigInt(0) 
                    ,
                    tokenAddress: ""
                });
                return Promise.resolve("accept");
            default:
                return Promise.resolve("reject");
        }
    } catch (error) {
        console.error("Error processing command:", error);
        return Promise.resolve("reject");
    }
});

router.add<{ address: string }>(
    "wallet/:address",
    ({ params: { address } }) => {
        return JSON.stringify({
            etherBalance: wallet.etherBalanceOf(address)
        });
    }
);

router.add<{ gameId: string }>(
    "game/:gameId",
    ({ params: { gameId } }) => {
        const game = games.get(gameId);
        if (!game) return "Game not found";
        return JSON.stringify(game.getInfo()); 
    }
);

app.addInspectHandler(router.handler);

app.start().catch((error) => {
    console.error("Failed to start the application:", error);
    process.exit(1);
});
