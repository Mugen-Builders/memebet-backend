import { toHex } from "viem";
import { InspectHandlers } from ".";
import { jsonReplacer } from "./utils";

export const register: InspectHandlers = ({ app, wallet, router, appManager }) => {
    router.add<{ gameId: string }>(
        "games/getGame/:gameId",
        ({ params: { gameId } }) => {
            const game = appManager.getGameById(toHex(Number(gameId)));
            if (!game) return "Game not found";
            return JSON.stringify(game.getInfo(), jsonReplacer, 2);
        }
    );

    router.add("games/currentGames", () => {
        try {
            const allGames = Array.from(appManager.listActiveGames());
            if (allGames.length === 0) {
                return JSON.stringify("There are no current games ongoing!");
            }

            return JSON.stringify(allGames, jsonReplacer, 2);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Error retrieving current games:", error);
                return JSON.stringify({ error: error.message });
            } else {
                console.error("An unknown error occurred while retrieving current games:", error);
                return JSON.stringify({ error: "An unknown error occurred" });
            }
        }
    });
}