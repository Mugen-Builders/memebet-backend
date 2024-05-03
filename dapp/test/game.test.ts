import { describe, test, expect, beforeEach, vi } from 'vitest';
import BetPool from '../src/BetPool';
import Game from '../src/Game';
import { WalletApp } from "@deroll/wallet";
import { ValidatorFunctionRunner } from "../src/validator";
import { Bet, PlayerBet } from "../src/types";
import { Hex } from 'viem';

describe('Game', () => {
    let game: Game;
    let mockWallet: WalletApp;
    let mockValidatorFunctionRunner: ValidatorFunctionRunner;
    let mockToken: Hex = '0xf795b3D15D47ac1c61BEf4Cc6469EBb2454C6a9b';


    beforeEach(() => {
        mockWallet = {
            transferERC20: vi.fn(),
        } as unknown as WalletApp;

        mockValidatorFunctionRunner = {
            run: vi.fn().mockResolvedValue("football"),
        } as unknown as ValidatorFunctionRunner;

        game = new Game(["football", "basketball"], Date.now(), Date.now() + 3600000, mockToken, mockValidatorFunctionRunner, mockWallet);
        vi.spyOn(game.betPool, 'payout');
    });

    test('should make a bet and update player bets', () => {
        const bet: Bet = {
            pick: "football",
            tokenAddress: mockToken,
            player: "0xPlayer",
            amount: BigInt(500),
            effectiveAmount: BigInt(0)
        };

        game.makeBet = vi.fn();

        const playerBets = game.playersBets.get("0xPlayer");
        expect(playerBets).toBeTruthy();
        expect(playerBets!.get(bet.pick)).toContainEqual(bet);
    });


    test('should handle game settlement correctly', async () => {
        game.makeBet({ pick: "football", tokenAddress: mockToken, player: "0xPlayer", amount: BigInt(1000), effectiveAmount: BigInt(0) });

        await game.settle("game data", "0xSignature");

        // Verify the settlement logic processes the winning pick
        expect(mockValidatorFunctionRunner.run).toHaveBeenCalled();
        expect(game.betPool.payout).toHaveBeenCalled();
    });

    test('should manage bets across different picks independently', () => {
        game.makeBet({ pick: "football", tokenAddress: mockToken, player: "0xPlayer1", amount: BigInt(500), effectiveAmount: BigInt(0) });
        game.makeBet({ pick: "basketball", tokenAddress: mockToken, player: "0xPlayer2", amount: BigInt(600), effectiveAmount: BigInt(0) });

        const footballBets = game.playersBets.get("0xPlayer1")!.get("football");
        const basketballBets = game.playersBets.get("0xPlayer2")!.get("basketball");

        expect(footballBets).toContainEqual(expect.objectContaining({ amount: BigInt(500) }));
        expect(basketballBets).toContainEqual(expect.objectContaining({ amount: BigInt(600) }));
    });

    test('should handle invalid winning picks correctly', async () => {
        game.makeBet({ pick: "football", tokenAddress: mockToken, player: "0xPlayer", amount: BigInt(1000), effectiveAmount: BigInt(0) });

        mockValidatorFunctionRunner.run.mockResolvedValue("invalid_pick"); // Simulate an invalid winning pick
        await game.settle("game data", "0xSignature");

        expect(game.betPool.payout).toHaveBeenCalledWith("invalid");
    });

});
