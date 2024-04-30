import { App } from "@deroll/core";
import { WalletApp } from "@deroll/wallet";
import { toHex } from "viem";

import { BasicArgs } from ".";

const createGame = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, metadata } = args;
  const { id, picks, start, validatorFunctionRunner, end } = inputArgs;
  //@TODO FIX to use game manager instance
  // if (!games.has(id)) {
  //     const newGame = new Game(picks, start, end, validatorFunctionRunner, new BetPool(picks, wallet));
  //     games.set(id, newGame);
  // }
  return "accept";
};

const placeBet = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, metadata } = args;
  const { gameid, player, pick, amount } = inputArgs;
   //@TODO FIX to use game manager instance
//   const game = games.get(gameid);
//   if (game) {
//     game.makeBet({
//       pick,
//       player,
//       amount: BigInt(amount),
//       effectiveAmount: BigInt(0),
//       tokenAddress: "",
//     });
    // return "accept";
//   }
  return "reject";
};


export const handlers = {
    createGame,
    placeBet
  }
  
  
  export const abi = [
    "function createGame(bytes32 gameid, bytes32[] picks, uint256 start, uint256 end)",
    "function placeBet(bytes32 gameid, address player, bytes32 pick, uint256 amount)"
  ]