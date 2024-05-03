import { describe, test, expect, beforeEach, vi, beforeAll } from 'vitest';
import { MockedObjectDeep } from '@vitest/spy';
import { AdvanceRequestData, Bet, PlayerBet } from "../../src/types";
import { Hex, toHex } from 'viem';
import * as gameRoutes from "../../src/advance/game"

import { createApp } from "@deroll/app";
import { App } from "@deroll/core";
import { WalletApp, createWallet } from '@deroll/wallet';
import AppManager from '../../src/AppManager';
import Governance from '../../src/Governance';
import Game from '../../src/Game';


const {
    createGame,
    closeGame,
    placeBet,
} = gameRoutes.handlers;

describe('Game Routes', () => {
    let app: MockedObjectDeep<App>
    let wallet: MockedObjectDeep<WalletApp>
    let appManager: MockedObjectDeep<AppManager>
    let governance: MockedObjectDeep<Governance>
    let basicMetadata: AdvanceRequestData["metadata"]
    let game: MockedObjectDeep<Game>

    beforeAll(() => {
        app = vi.mocked(createApp({ url: "http://127.0.0.1:8080/rollup" }), { deep: true });
        wallet = vi.mocked(createWallet(), { deep: true });
        appManager = vi.mocked(AppManager.getInstance(), { deep: true });
        governance = vi.mocked(Governance.getInstance(), { deep: true });
        basicMetadata = {
            msg_sender: toHex(155),
            epoch_index: 10,
            input_index: 10,
            block_number: 100,
            timestamp: Date.now()
        }
        game = vi.mocked(new Game([], 100, 110, toHex(10), wallet), { deep: true });
    });

    beforeEach(() => {
        vi.clearAllMocks(); // cleans the history of mocks
    });

    test('[placebet] should create a bet successfully', async () => {
        appManager.getGameById = vi.fn().mockReturnValue(game);
        game.makeBet = vi.fn() 
        const inputArgs = [
            "football-2024-10-11", //gameId
            toHex(12345), //player
            "pick",
            100, //amount
        ]
        const res = await placeBet(
            {
                inputArgs,
                app,
                wallet,
                metadata: basicMetadata,
                appManager,
                governance
            }
        );
        expect(appManager.getGameById).toHaveBeenCalledTimes(1);
        expect(game.makeBet).toHaveBeenCalledTimes(1);
        expect(res).toBe("accept");
    });

    test('[placebet] should reject if no game is found', async () => {
        appManager.getGameById = vi.fn().mockReturnValue(undefined);
        game.makeBet = vi.fn() 
        const inputArgs = [
            "football-2024-10-11", //gameId
            toHex(12345), //player
            "pick",
            100, //amount
        ]
        const res = await placeBet(
            {
                inputArgs,
                app,
                wallet,
                metadata: basicMetadata,
                appManager,
                governance
            }
        );
        expect(appManager.getGameById).toHaveBeenCalledTimes(1);
        expect(game.makeBet).toHaveBeenCalledTimes(0);
        expect(res).toBe("reject");
    });
});
