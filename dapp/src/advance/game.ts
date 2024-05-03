import { parseAbi, fromHex, toHex } from "viem";
import { BasicArgs } from ".";
import Game from "../Game";

const createGame = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, metadata, betsManager, governance } = args;

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
  if (!betsManager.gameSessions.has(id)) {
    const newGame = new Game(picks, start, end, token, validatorFunctionRunner, wallet);
    betsManager.gameSessions.set(id, newGame);
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


const placeBet = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, metadata, betsManager } = args;
  const { gameid, player, pick, amount } = inputArgs;
  const game = betsManager.gameSessions.get(gameid);
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
  placeBet
}


export const abi = [
  "function createGame(bytes32, bytes32, bytes32, bytes32, uint256, uint256)",
  "function placeBet(bytes32 gameid, address player, bytes32 pick, uint256 amount)"
];