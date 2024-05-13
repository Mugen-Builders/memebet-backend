import { describe, test, expect, beforeEach, vi } from 'vitest';
import BetPool, { resetPoolAddress } from '../src/BetPool';
import { WalletApp } from "@deroll/wallet";
import { Bet } from "../src/types";
import { Hex, toHex } from 'viem';

describe('BetPool', () => {
    let betPool: BetPool;
    let betPoolSingle: BetPool;
    let mockWallet: WalletApp;
    let mockToken: Hex = '0xf795b3D15D47ac1c61BEf4Cc6469EBb2454C6a9b';

    beforeEach(() => {
        // Mock WalletApp for testing without actual wallet operations
        resetPoolAddress();
        mockWallet = {
            transferERC20: vi.fn(),
            transferEther: vi.fn(),
        } as unknown as WalletApp;

        betPool = new BetPool(["football", "basketball"], mockToken, mockWallet);
        betPoolSingle = new BetPool(["football"], mockToken, mockWallet);
    });

    test('should correctly handle the effective amount calculation when only one bet is placed on a pick', () => {
        const bet = {
            pick: "football",
            tokenAddress: mockToken,
            player: "0xPlayer1",
            amount: BigInt(500),
            effectiveAmount: BigInt(0) // Initialize to zero
        };

        // Add the single bet
        betPoolSingle.addBet(bet);

        // Check if the funds are locked correctly
        expect(betPoolSingle.fundsLocked).toEqual(BigInt(500));

        // Retrieve the bet to check the effective amount
        const bets = betPoolSingle.picksBets.get("football");
        expect(bets!.length).toBe(1);
        expect(bets![0]!.effectiveAmount).toEqual(BigInt(500));

        // Verify the wallet transfer call was made correctly
        expect(mockWallet.transferERC20).toHaveBeenCalledWith(
            expect.anything(),
            bet.player,
            betPoolSingle.poolAddress,
            bet.amount
        );
    });

    test('should add a bet and calculate the effective bet amount', () => {
        const bet: Bet = {
            pick: "football",
            tokenAddress: mockToken,
            player: "0xPlayer",
            amount: BigInt(1000),
            effectiveAmount: BigInt(0)
        };

        betPool.addBet(bet);

        // Check if the funds are locked correctly
        expect(betPool.fundsLocked).toEqual(BigInt(1000));

        // Check if the effective bets map is updated
        expect(betPool.effectiveBets.get("football")).not.toEqual(BigInt(0));

        // Verify the wallet transfer call
        expect(mockWallet.transferERC20).toHaveBeenCalled();
    });

    test('should handle payouts for winning picks correctly', () => {
        // Adding some bets
        betPool.addBet({ pick: "football", tokenAddress: mockToken, player: "0xPlayer1", amount: BigInt(100), effectiveAmount: BigInt(0) });
        betPool.addBet({ pick: "basketball", tokenAddress: mockToken, player: "0xPlayer2", amount: BigInt(200), effectiveAmount: BigInt(0) });

        // Trigger payout for winning pick
        betPool.payout("win", ["football"]);

        // Verify if the redistribution function is called with effective amounts
        expect(mockWallet.transferERC20).toHaveBeenCalled();
    });

    test('should handle multiple bets on the same pick correctly', () => {
        betPool.addBet({ pick: "football", tokenAddress: mockToken, player: "0xPlayer1", amount: BigInt(100), effectiveAmount: BigInt(0) });
        betPool.addBet({ pick: "football", tokenAddress: mockToken, player: "0xPlayer2", amount: BigInt(200), effectiveAmount: BigInt(0) });

        expect(betPool.fundsLocked).toEqual(BigInt(300));
        const bets = betPool.picksBets.get("football");
        expect(bets!.length).toBe(2);
        expect(bets).toContainEqual(expect.objectContaining({ player: "0xPlayer1", amount: BigInt(100) }));
        expect(bets).toContainEqual(expect.objectContaining({ player: "0xPlayer2", amount: BigInt(200) }));
    });

    test('should calculate effective bet amounts correctly', () => {
        betPool.addBet({ pick: "football", tokenAddress: mockToken, player: "0xPlayer1", amount: BigInt(100), effectiveAmount: BigInt(0) });
        betPool.addBet({ pick: "football", tokenAddress: mockToken, player: "0xPlayer2", amount: BigInt(300), effectiveAmount: BigInt(0) });

        const lastBet = betPool.picksBets.get("football")![1];
        expect(lastBet!.effectiveAmount).toBeGreaterThan(BigInt(0)); // Assuming some effective amount calculation logic
    });
    test('should transfer remaining funds to DAO when closing', () => {
        // Simulate some remaining funds
        const ERC20_TOKEN = "0xf795b3D15D47ac1c61BEf4Cc6469EBb2454C6a9b"; //this is the sunodo token a sample erc20 token
        const POOL_ADDRESS = toHex(1); //this is a sample address for bet pool
        const DAO_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; //this is a sample address for the DAO

        betPool.fundsLocked = BigInt(1000);

        betPool.close();

        // Verify funds are transferred to the DAO
        expect(mockWallet.transferERC20).toHaveBeenCalledWith(ERC20_TOKEN, POOL_ADDRESS, DAO_ADDRESS, BigInt(1000));
    });

    test('should not attempt to transfer funds if none are locked', () => {
        betPool.fundsLocked = BigInt(0);

        betPool.close();

        // Ensure no transfer is attempted
        expect(mockWallet.transferERC20).not.toHaveBeenCalled();
    });


});
