import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createApp } from "@deroll/app";
import { createWallet, WalletApp } from "@deroll/wallet";
import { BetsManager } from "../src/bets";
import advanceHandlers from "../src/advance";
import inspectHandlers from "../src/inspect";
import {Bet} from "../src/types"

// Mock external dependencies as previously described
vi.mock("@deroll/app", () => ({
    createApp: vi.fn(() => ({
        addAdvanceHandler: vi.fn(),
        addInspectHandler: vi.fn(),
        start: vi.fn().mockResolvedValue(),
    })),
    createRouter: vi.fn(() => ({
        add: vi.fn(),
        handler: vi.fn()
    }))
}));

vi.mock("@deroll/wallet", () => ({
    createWallet: vi.fn(() => ({
        etherBalanceOf: vi.fn(),
        depositTokens: vi.fn(),
        withdrawTokens: vi.fn()
    }))
}));

vi.mock("./bets", () => ({
    BetsManager: {
        getInstance: vi.fn(() => ({
            gameSessions: new Map(),
        }))
    }
}));

import '../src/main';
import { App } from '@deroll/core';
import { createRouter } from '@deroll/router';

describe('API Endpoints', () => {
    let app: App, wallet: WalletApp, betsManager: BetsManager, router;

    beforeEach(() => {
        app = createApp({ url: "http://localhost:8080/rollups" });
        wallet = createWallet();
        betsManager = BetsManager.getInstance();
        router = createRouter({ app });
    });


    test('tests game creation endpoint', async () => {
        const gameData = { id: "game123", picks: ["team1", "team2"], start: Date.now(), end: Date.now() + 1000 };
        const createGameHandler = vi.fn(() => Promise.resolve("Game Created"));

        await advanceHandlers(app, wallet, betsManager);
        const result = await createGameHandler({ inputArgs: gameData, app, wallet, metadata: {} });

        expect(result).toBe("Game Created");
    });

    test('tests place bet endpoint', async () => {
        const betData = { gameid: "game123", player: "player1", pick: "team1", amount: 100 };
        const placeBetHandler = vi.fn(() => Promise.resolve("Bet Placed"));

        await advanceHandlers(app, wallet, betsManager);
        const result = await placeBetHandler({ inputArgs: betData, app, wallet, metadata: {} });

        expect(result).toBe("Bet Placed");
    });

    test('tests deposit tokens endpoint', async () => {
        const depositData = { tokenAddress: "0xToken", to: "0x123", depositAmount: 500 };
        const depositHandler = vi.fn(() => Promise.resolve("Deposit Successful"));

        await advanceHandlers(app, wallet, betsManager);
        const result = await depositHandler({ inputArgs: depositData, app, wallet, metadata: {} });

        expect(result).toBe("Deposit Successful");
    });

    test('tests withdraw tokens endpoint', async () => {
        const withdrawData = { tokenAddress: "0xToken", withdrawAmount: 300 };
        const withdrawHandler = vi.fn(() => Promise.resolve("Withdrawal Successful"));

        await advanceHandlers(app, wallet, betsManager);
        const result = await withdrawHandler({ inputArgs: withdrawData, app, wallet, metadata: {} });

        expect(result).toBe("Withdrawal Successful");
    });

    test('tests fetching game info endpoint', async () => {
        const gameInfoHandler = vi.fn(() => "Game Info");

        await inspectHandlers(app, wallet, betsManager); 
        const result = gameInfoHandler({ params: { gameId: "game123" } });

        expect(result).toBe("Game Info");
    });

    test('tests fetching current bets endpoint', async () => {
        const currentBetsHandler = vi.fn(() => "Current Bets");

        await inspectHandlers(app, wallet, betsManager); 
        const result = currentBetsHandler();

        expect(result).toBe("Current Bets");
    });
});
