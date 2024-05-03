import { describe, test, expect, beforeEach, vi, beforeAll } from 'vitest';
import { MockedObjectDeep } from '@vitest/spy';
import { AdvanceRequestData, Bet, PlayerBet } from "../src/types";
import { Hex, toHex } from 'viem';
import * as gameRoutes from "../src/advance/game"

import { createApp } from "@deroll/app";
import { App } from "@deroll/core";
import { WalletApp, createWallet } from '@deroll/wallet';
import AppManager from '../src/AppManager';
import Governance from '../src/Governance';
import Game from '../src/Game';


const {
    createGame,
    closeGame,
    placeBet,
} = gameRoutes.handlers;

describe('Game', () => {
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
        vi.clearAllMocks();
    });

    describe('Games', () => {
        test('should place a bet and update player bets', async () => {
            const gameId = "football-2024-10-11";
            const player = toHex(12345);
            const pick = "team1";
            const amount = BigInt(500);

            const bet = {
                gameid: gameId,
                player: player,
                pick: pick,
                amount: amount,
                effectiveAmount: BigInt(0)
            };

            // Mocking the retrieval of the game
            appManager.getGameById = vi.fn().mockReturnValue(game);

            // Mocking the game method to simulate a bet being made
            game.makeBet = vi.fn().mockImplementation(() => "accept");

            // Executing the placeBet function with the structured input
            const result = await placeBet({
                inputArgs: [gameId, player, pick, amount],
                app,
                wallet,
                metadata: basicMetadata,
                appManager,
                governance
            });

            // Assertions to verify the correct behavior
            expect(appManager.getGameById).toHaveBeenCalledWith(gameId);
            expect(game.makeBet).toHaveBeenCalledWith({
                pick: pick,
                player: player,
                amount: amount,
                effectiveAmount: BigInt(0),
                tokenAddress: "" // Assuming your Game.makeBet expects this format
            });
            expect(result).toBe("accept");
        });


        test('should handle game settlement correctly', async () => {
            vi.spyOn(game.betPool, 'payout').mockImplementation(() => { });
            game.settle = vi.fn().mockImplementation(async () => {
                game.betPool.payout("win", ["team1"]);
            });
            await game.settle("game data", "0xSignature");
            expect(game.settle).toHaveBeenCalled();
            expect(game.betPool.payout).toHaveBeenCalledWith("win", ["team1"]);
        });

        test('should handle invalid winning picks correctly', async () => {
            vi.spyOn(game.betPool, 'payout').mockImplementation(() => { });
            game.settle = vi.fn().mockImplementation(async () => {
                game.betPool.payout("invalid");
            });

            await game.settle("invalid game data", "0xSignature");
            expect(game.settle).toHaveBeenCalled();
            expect(game.betPool.payout).toHaveBeenCalledWith("invalid");
        });

    });

});
