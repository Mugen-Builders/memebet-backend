import { InspectHandlers } from ".";

export const register:InspectHandlers = ({app, wallet, router, appManager}) => {
    router.add<{ gameId: string }>(
        "games/getGame/:gameId",
        ({ params: { gameId } }) => {
            const game = appManager.getGameById(gameId);
            if (!game) return "Game not found";
            return JSON.stringify(game.getInfo());
        }
    );
    
    router.add("games/currentBets",
        () => {
            const allBets = Array.from(appManager.activeGames.values()).map(game => ({
                gameId: game.id,
                bets: game.getInfo()
            }));
            return JSON.stringify(allBets);
        }
    );
}