import { fromHex, toHex } from "viem";
import { BasicArgs, HandlerFunction } from ".";

const createGame: HandlerFunction = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, metadata, appManager, governance, validatorManager } = args;
  if (!governance.isMember(metadata.msg_sender)) {
    app.createReport({
      payload: toHex("Sender is not member of the DAO"),
    });
    return "reject";
  }

  const [id, home, away, token, start, end, validatorFunctionName] = inputArgs;

  //Just Testing
  let pickHome = fromHex(home, 'string').replace(/ +/g, '');
  let pickAway = fromHex(away, 'string').replace(/ +/g, '');

  const validatorFunctionRunner = validatorManager.getValidator(validatorFunctionName);
  if (!validatorFunctionRunner) {
    app.createReport({
      payload: toHex("Invalid validator function name"),
    });
    return "reject";
  }

  let picks: string[] = [pickHome, pickAway];
  if (!appManager.activeGames.has(id)) {
    appManager.createGame(picks, start, end, token, validatorFunctionRunner);
    app.createNotice({
      payload: toHex("Game Created Sucessfully!"),
    });
  } else {
    app.createReport({
      payload: toHex("Game already exists!"),
    });
    return "reject";
  }
  return "accept";
};

const closeGame: HandlerFunction = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, metadata, appManager } = args;
  //@TODO
  //appManager.closeGame(id);
  return "reject";
};

const placeBet: HandlerFunction = async (args: BasicArgs) => {
  const { inputArgs, appManager } = args;
  const [gameid, player, pick, amount] = inputArgs;
  const game = appManager.getGameById(gameid);
  if (game) {
    game.makeBet({
      pick,
      player,
      amount: BigInt(amount),
      effectiveAmount: BigInt(0),
      tokenAddress: "",
    });
    return "accept";
  }
  return "reject";
};


export const handlers = {
  createGame,
  closeGame,
  placeBet,
}


export const abi = [
  "function createGame(bytes32 gameid, bytes32 home, bytes32 away, address token , uint256 start, uint256 end)",
  "function closeGame(@TODO PARAMS)",
  "function placeBet(bytes32 gameid, address player, bytes32 pick, uint256 amount)",
];