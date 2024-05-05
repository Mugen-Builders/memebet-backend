import Game from './Game';
import { WalletApp, createWallet } from '@deroll/wallet';
import { Hex } from 'viem';
import { ValidatorManager } from './validator';

// Higher level manager for all things bet
// Handles the creation and listing of new models
// Handles the creation and listing of new games
export default class AppManager {
    private static instance: AppManager;
    private static wallet: WalletApp;
    private static validatorManager: ValidatorManager;

    activeGames: Map<string, Game>;

    private constructor() {
        this.activeGames = new Map<string, Game>();
        AppManager.wallet = createWallet();
        AppManager.validatorManager = ValidatorManager.getInstance();
    }

    public static getInstance(): AppManager {
        if (!AppManager.instance) {
            AppManager.instance = new AppManager();
        }
        return AppManager.instance;
    }

    public getWallet(): WalletApp {
        return AppManager.wallet;
    }

    //@todo createGame needs to get a "verify function" name string here
    //use Validator Manager to resolve the name into actual ValidatorFunctionRunner
    createGame(picks: Array<string>, start: number, end: number, tokenAddress: Hex /**VFun here */) {
        const game = new Game(picks, start, end, tokenAddress, AppManager.wallet);
        this.activeGames.set(game.id, game);
        return game;
    }

    async closeGame(gameId: string, data: string, signature: Hex) {
        const game = this.activeGames.get(gameId);
        if (!game) {
            throw new Error("No Game found");
        }
        await game.settle(data, signature);
        this.activeGames.delete(gameId);
    }

    getGameById(gameId: string): Game | undefined {
        return this.activeGames.get(gameId);
    }

    listActiveGames() {
        //@TODO might be interesting adding extra info such as bets per game
        const games = [];
        for (const game of this.activeGames.values()) {
            games.push(game);
        }
        return games;
    }
}
