import Game from './Game';


// Higher level manager for all things bet
// Handles the creation and listing of new models
// Handles the creation and listing of new games
export default class AppManager {
    //Changed implementation to support singleton
    gameTypes: Map<string, any> //we might need a game interface here
    gameSessions: Map<string, any>
    private static instance: AppManager;

    constructor() {
        this.gameTypes = new Map();
        this.gameSessions = new Map();
    }

    public static getInstance(): AppManager {
        if (!AppManager.instance) {
            AppManager.instance = new AppManager();
        }
        return AppManager.instance;
    }

    createNewGameType(...args: any[]) { //only DAO
        this.gameTypes.set(args[0], new Game(args[1], args[2], args[3], args[4], args[5]));
    }

    createNewGame(_type: any) {

        const factoryInstance = <Game>this.gameTypes.get(_type);
        if (factoryInstance) {
            //@To-do create a new game
        } else {
            console.log(`game type:${_type} not supported by the platform make a proposal to our dao to add this game type`);
            return
        } // teams, dates, championshi

    }

    getGameById(gameId: string): Game | undefined {
        return this.gameSessions.get(gameId);
    }
}