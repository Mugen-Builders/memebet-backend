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
import { ValidatorManager } from '../src/validator';


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
    let validatorManager: ValidatorManager
    let basicMetadata: AdvanceRequestData["metadata"]
    let game: MockedObjectDeep<Game>
    const tokenAddress: Hex = '0xf795b3D15D47ac1c61BEf4Cc6469EBb2454C6a9b';

    beforeAll(() => {
        app = vi.mocked(createApp({ url: "http://127.0.0.1:8080/rollup" }), { deep: true });
        wallet = vi.mocked(createWallet(), { deep: true });
        appManager = vi.mocked(AppManager.getInstance(), { deep: true });
        governance = vi.mocked(Governance.getInstance(), { deep: true });

        validatorManager = ValidatorManager.getInstance();
        const testValidatorFunction = "async () => 'test_result'";
        validatorManager.createNewValidator("test_name", testValidatorFunction);
        const validator = validatorManager.getValidator('test_name')!;

        basicMetadata = {
            msg_sender: toHex(155),
            epoch_index: 10,
            input_index: 10,
            block_number: 100,
            timestamp: Date.now()
        }
        game = vi.mocked(new Game(["team1", "team2"], 100, 110, toHex(10), wallet, validator ), { deep: true });
        
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Games', () => {
        test('should place a bet and update player bets', async () => {
            const player = toHex(12345);
            const pick = "team1";
            const amount = BigInt(500);
            const token = "0x0000000000000000000000000000000000000000"
            
            appManager.getGameById = vi.fn().mockReturnValue(game);

            game.makeBet = vi.fn().mockImplementation(() => "accept");

            const result = await placeBet({
                inputArgs: [player, pick, token, amount],
                app,
                wallet,
                metadata: basicMetadata,
                appManager,
                governance,
                validatorManager
            });

            expect(appManager.getGameById).toHaveBeenCalledWith(Number('9'));
            expect(result).toBe("accept");
        });
        

        test('should get game info correctly', () => {
            const expectedInfo = {
                id: game.id,
                picks: ["team1", "team2"],
                startTime: 100,
                endTime: 110,
                fees: 2,
                playerIds: [],
                currentOdds: [
                    ["team1", BigInt(0)],
                    ["team2", BigInt(0)]
                ]
            };
            //@TODO you shouldn't test directly a mocked object
            expect(game.getInfo()).toEqual(expectedInfo);
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

        test('should manage bets across different picks independently', async () => {
            const player1 = toHex(12345);
            const player2 = toHex(12346);

            const bet1: Bet = {
                pick: "team1",
                player: player1,
                amount: BigInt(500),
                effectiveAmount: BigInt(500),
                tokenAddress
            };

            const bet2: Bet = {
                pick: "team2",
                player: player2,
                amount: BigInt(300),
                effectiveAmount: BigInt(300),
                tokenAddress
            };

            game.makeBet = vi.fn().mockImplementation(b => {
                let playerBets = game.playersBets.get(b.player) || new Map<string, Bet[]>();
                let betsOnPick = playerBets.get(b.pick) || [];
                betsOnPick.push(b);
                playerBets.set(b.pick, betsOnPick);
                game.playersBets.set(b.player, playerBets);
            });

            game.makeBet(bet1);
            game.makeBet(bet2);

            expect(game.playersBets.get(player1).get("team1")[0].amount).toEqual(BigInt(500));
            expect(game.playersBets.get(player2).get("team2")[0].amount).toEqual(BigInt(300));
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

        test('should retrieve player bets correctly', async () => {
            const player = toHex(4444);
            const pick = "team1";
            const amount = BigInt(500);

            const bet: Bet = {
                pick,
                player,
                amount,
                effectiveAmount: BigInt(500),
                tokenAddress
            };

            game.makeBet = vi.fn().mockImplementation(b => {
                let playerBets = game.playersBets.get(b.player) || new Map<string, Bet[]>();
                let betsOnPick = playerBets.get(b.pick) || [];
                betsOnPick.push(b);
                playerBets.set(b.pick, betsOnPick);
                game.playersBets.set(b.player, playerBets);
            });

            game.makeBet(bet);
            const expectedPlayerBets = {
                player,
                Bet: new Map<string, Bet[]>([
                    ["team1", [bet]]
                ])
            };
            expect(game.getPlayer(player)).toEqual(expectedPlayerBets);
        });

    });

});
