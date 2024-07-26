import { fromBytes, fromHex, toHex } from "viem";
import { BasicArgs, HandlerFunction } from ".";

const createGame: HandlerFunction = async (args: BasicArgs) => {
  const { inputArgs, app, metadata, appManager, governance, validatorManager } = args;
  if (!governance.isMember(metadata.msg_sender)) {
    app.createReport({
      payload: toHex("Sender is not member of the DAO"),
    });
    return "reject";
  }

  const [home, away, token, start, end, validatorFunctionNameHx] = inputArgs;

  let pickHome = fromHex(home, 'string').replace(/\0/g, '');
  let pickAway = fromHex(away, 'string').replace(/\0/g, '');
  let validatorFunctionName = fromHex(validatorFunctionNameHx, 'string').replace(/\0/g, '');

  const validatorFunctionRunner = validatorManager.getValidator(validatorFunctionName);
  if (!validatorFunctionRunner) {
    app.createReport({
      payload: toHex("Invalid validator function name"),
    });
    return "reject";
  }

  let picks: string[] = [pickHome, pickAway];
  try {
    appManager.createGame(picks, start, end, token, validatorFunctionRunner);
    app.createNotice({
      payload: toHex("Game Created Sucessfully!"),
    });
  } catch (error) {
    app.createReport({
      payload: toHex("Error Creating Game: " + error),
    });
    return "reject";
  }
  return "accept";
};

const closeGame: HandlerFunction = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, metadata, appManager } = args;
  const [id, data] = inputArgs;
  try {
    appManager.closeGame(id, data, metadata.msg_sender);
    app.createNotice({
      payload: toHex(`Game ${ id } closed sucessfully!`),
    });
    return "accept";
  } catch (error) {
    app.createReport({
      payload: toHex("Error Closing Game: " + error), 
    });
    return "reject";
  }
};

const placeBet: HandlerFunction = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, appManager, metadata} = args;
  const [hexGameid, pick, token, amount] = inputArgs;
  let player = metadata.msg_sender;
  let gameid = fromHex(hexGameid, 'string').replace(/\0/g, '');
  const game = appManager.getGameById(Number(gameid));
  if (game) {
    game.makeBet({
      pick,
      player,
      amount: BigInt(amount),
      effectiveAmount: BigInt(0),
      tokenAddress: token,
    });
    app.createNotice({
      payload: toHex("Bet Placed Sucessfully!"),
    });
    return "accept";
  }
  app.createReport({
    payload: toHex("PlaceBet Failed!"),
  });
  return "reject";
};


export const handlers = {
  createGame,
  closeGame,
  placeBet,
}


export const abi = [
  "function createGame(bytes32 home, bytes32 away, address token , uint256 start, uint256 end, bytes32 validatorFunctionName)",
  "function closeGame(bytes32 gameid)",
  "function placeBet(bytes32 gameid, bytes32 pick, address token, uint256 amount)",
];