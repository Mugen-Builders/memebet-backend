import { describe, test, expect, beforeEach, vi, MockedObject } from 'vitest';
import Game from '../src/Game';
import AppManager from '../src/AppManager';
import { WalletApp, createWallet } from '@deroll/wallet';
import { Hex, toHex } from 'viem';

describe('AppManager', () => {
    let appManager: MockedObject<AppManager>;
    let mockWallet: MockedObject<WalletApp>;
    const mockTokenAddress: Hex = '0xf795b3D15D47ac1c61BEf4Cc6469EBb2454C6a9b';

    beforeEach(() => {
        appManager = vi.mocked(AppManager.getInstance(), { deep: true });
        mockWallet = vi.mocked(createWallet(), { deep: true });
        AppManager['wallet'] = mockWallet;

        vi.clearAllMocks();
    });

    test('should get wallet instance', () => {
        const wallet = appManager.getWallet();
        expect(wallet).toBe(mockWallet);
    });

    test('should create a new game', () => {
        const picks = ['team1', 'team2'];
        const start = 1691011200; 
        const end = 1691014800; 

        const newGame = appManager.createGame(picks, start, end, mockTokenAddress);

        expect(newGame).toBeInstanceOf(Game);
        expect(newGame.picks).toEqual(picks);
        expect(appManager.getGameById(newGame.id)).toBe(newGame);
    });

    test('should close an existing game', async () => {
        const gameData = {
            picks: ['team1', 'team2'],
            start: 1691011200,
            end: 1691014800,
            tokenAddress: mockTokenAddress,
        };

        // Create a new game and add it to active games
        const newGame = appManager.createGame(gameData.picks, gameData.start, gameData.end, gameData.tokenAddress);

        // Mock settle method of Game
        vi.spyOn(newGame, 'settle').mockResolvedValue();

        await appManager.closeGame(newGame.id, 'game data', '0xSignature' as Hex);

        expect(newGame.settle).toHaveBeenCalledWith('game data', '0xSignature');
        expect(appManager.getGameById(newGame.id)).toBeUndefined();
    });

    test('should throw error when closing a non-existing game', async () => {
        await expect(appManager.closeGame('non-existent-game-id', 'game data', '0xSignature' as Hex))
            .rejects.toThrow('No Game found');
    });

    test('should return the correct game by ID', () => {
        const picks = ['team1', 'team2'];
        const start = 1691011200;
        const end = 1691014800;

        const game = appManager.createGame(picks, start, end, mockTokenAddress);

        expect(appManager.getGameById(game.id)).toBe(game);
    });

    test('should list all active games', () => {
        const game1 = appManager.createGame(['team1', 'team2'], 1691011200, 1691014800, mockTokenAddress);
        const game2 = appManager.createGame(['team3', 'team4'], 1691014900, 1691018500, mockTokenAddress);

        const activeGames = appManager.listActiveGames();

        expect(activeGames).toContain(game1);
        expect(activeGames).toContain(game2);
    });
});
