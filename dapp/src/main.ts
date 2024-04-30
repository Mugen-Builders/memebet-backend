import { createApp } from "@deroll/app";
import { createRouter } from "@deroll/router";
import { createWallet, ERC20Deposit } from "@deroll/wallet";
import { toHex } from "viem";
import { Game, BetPool } from "./bets"; // Ensure these are defined to manage betting logic

const app = createApp({ url: "http://localhost:8080/rollups" });
const wallet = createWallet();


const games = new Map<string, Game>();

// Router to handle HTTP-like requests
const router = createRouter({ app });

// Handling incoming blockchain commands
app.addAdvanceHandler(async ({ payload, metadata }) => {
    try {
        const hexString = payload.replace(/^0x/, '');
        const buffer = Buffer.from(hexString, "hex");
        const utf8String = buffer.toString("utf8");
        console.log(utf8String);
        const inputData = JSON.parse(utf8String);

        switch (inputData.functionName) {
            case "createGame":
                const { id, picks, start, validatorFunctionRunner, end } = inputData;
                if (!games.has(id)) {
                    const newGame = new Game(picks, start, end, validatorFunctionRunner, new BetPool(picks, wallet));
                    games.set(id, newGame);
                }
                return Promise.resolve("accept");
            case "placeBet":
                const { gameid, player, pick, amount } = inputData;
                const game = games.get(gameid);
                if (game) {
                    game.makeBet({
                        pick,
                        player,
                        amount: BigInt(amount),
                        effectiveAmount: BigInt(0),
                        tokenAddress: ""
                    });
                    return Promise.resolve("accept");
                }
                return Promise.resolve("reject");
            case "depositTokens":
                try {
                const { tokenAddress, to,depositAmount } = inputData;
                wallet.transferERC20(tokenAddress, metadata.msg_sender,to , depositAmount);
                app.createNotice({
                    payload: toHex(
                        `The account ${metadata.msg_sender} is transferring ${amount
                        } tokens ${tokenAddress} from ${metadata.msg_sender} to ${to} at ${metadata.timestamp}`
                    ),
                })
                    return Promise.resolve("accept");
            }catch (error){
                    console.error("Error processing command:", error);
                    return Promise.resolve("reject");
                };
            case "withdrawTokens":
                try{
                const { tokenAddress: withdrawToken, withdrawAmount } = inputData;
                app.createVoucher(
                    wallet.withdrawERC20(withdrawToken, metadata.msg_sender, withdrawAmount)
                );
                app.createNotice({
                    payload: toHex(
                        `The account ${metadata.msg_sender} is withdrawing ${amount
                        } tokens of ${withdrawToken} at ${metadata.timestamp}.`
                    ),
                });
                    return Promise.resolve("accept");
            }catch (error){
                console.error("Error processing command:", error);
                return Promise.resolve("reject");
            }
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

router.add("currentBets",
    () => {
        const allBets = Array.from(games.values()).map(game => ({
            gameId: game.id,
            bets: game.getInfo()
        }));
        return JSON.stringify(allBets);
    }
);

app.addInspectHandler(router.handler);

app.start().catch((error) => {
    console.error("Failed to start the application:", error);
    process.exit(1);
});
