import { parseAbi, fromHex, toHex } from "viem";
import { BasicArgs } from ".";
import Game from "../Game";

const createGame = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, metadata, appManager, governance } = args;

  // only members can create games
  if (!governance.isMember(metadata.msg_sender)) {
    app.createReport({
      payload: toHex("Sender is not member of the DAO"),
    });
  }
  //@TODO fix inputArgs; type and args don't match
  const [id, home, away, token, start, validatorFunctionRunner, end] = inputArgs;

  //Just Testing
  let pickHome = fromHex(home, 'string').replace(/ +/g, '');
  let pickAway = fromHex(away, 'string').replace(/ +/g, '');

  let picks: string[] = [pickHome, pickAway];
  if (!appManager.activeGames.has(id)) {
    appManager.createGame(picks, start, end, token);
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

const closeGame = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, metadata, appManager } = args;
  //@TODO
  //appManager.closeGame(id);
};
const getGames = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, metadata } = args;
}

const placeBet = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, metadata, appManager } = args;
  const { gameid, player, pick, amount } = inputArgs;
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
  "function createGame(bytes32, bytes32, bytes32, bytes32, uint256, uint256)",
  "function closeGame(@TODO PARAMS)",
  "function placeBet(bytes32 gameid, address player, bytes32 pick, uint256 amount)",
];