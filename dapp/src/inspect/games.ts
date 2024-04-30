import { InspectHandlers } from ".";

export const register:InspectHandlers = ({app, wallet, router, games}) => {
    router.add<{ gameId: string }>(
        "game/:gameId",
        ({ params: { gameId } }) => {
            const game = games.get(gameId);
            if (!game) return "Game not found";
            return JSON.stringify(game.getInfo());
        }
    );
    
    router.add("currentBets",
        () => {
            const allBets = Array.from(games.values()).map(game => ({
                gameId: game.id,
                bets: game.getInfo()
            }));
            return JSON.stringify(allBets);
        }
    );
}