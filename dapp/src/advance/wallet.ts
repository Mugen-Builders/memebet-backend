import { toHex, parseAbi, encodeFunctionData, Hex } from "viem";
import { App } from "@deroll/core";

import { BasicArgs } from "./index";

import { AdvanceRequestHandler } from "../types";
import {
  WalletApp, isEtherDeposit,
  isERC20Deposit,
  isERC721Deposit,
  isERC1155SingleDeposit,
  isERC1155BatchDeposit,
  parseERC1155BatchDeposit,
  parseERC1155SingleDeposit,
  parseERC20Deposit,
  parseERC721Deposit,
  parseEtherDeposit,
} from "@deroll/wallet";


// faciliates decoding for 0.8.1 version of Tikua
const depositNoticePayload = (functionName:any, idOrAmount: Readonly<bigint|bigint[]>, address?:Hex) => {
  const abi = parseAbi([
    "function depositEther(uint256 amount)",
    "function depositERC20(uint256 amount)",
    "function depositERC721(uint256 id, address tokenAddress)",
    "function depositERC1155Single(uint256 id, address tokenAddress)",
    "function depositERC1155Batch(uint256[] ids, address tokenAddress)",
  ]);
  if (!abi.map((a) => a.name).includes(functionName)) {
    throw new Error("Invalid function name");
  }
  let args = [idOrAmount];
  if (address) {
    args.push(address as any);
  }
  const payload = encodeFunctionData({
    abi,
    functionName,
    args: args as any,
  });
  console.log("depositNoticePayload", payload);
  return payload;
}

export const addTokensDepositHandler = (app: App, wallet: WalletApp) => {
  const handler: AdvanceRequestHandler = async (data) => {
    try {
      const result = await wallet.handler(data);
      
      if (result === "reject") return result;
      
      let msg = 'empty';
      if (isEtherDeposit(data)) {
        let { sender, value } = parseEtherDeposit(data.payload);
        // msg = `${sender} deposited ${value} ether`;
        msg = depositNoticePayload("depositEther", value);
      }
      if (isERC20Deposit(data)) {
        let { success, token, sender, amount } = parseERC20Deposit(
          data.payload,
        );
        // msg = success ? `${sender} deposited ${amount} of ${token}` : `${sender} failed to deposit ${amount} of ${token}`;
        msg = depositNoticePayload("depositERC20", amount, token);
      }
      if (isERC721Deposit(data)) {
        const { sender, token, tokenId } = parseERC721Deposit(data.payload);
        // msg = `${sender} deposited ${tokenId} of 721 ${token}`;
        msg = depositNoticePayload("depositERC721", tokenId, token);

      }
      if (isERC1155SingleDeposit(data)) {
        const { sender, token, tokenId, value } = parseERC1155SingleDeposit(
          data.payload,
        );
        // msg = `${sender} deposited single ${tokenId} of 1155 ${token}`;
        msg = depositNoticePayload("depositERC1155Single", tokenId, token);
      }
      if (isERC1155BatchDeposit(data)) {
        const { sender, token, tokenIds, values } =
          parseERC1155BatchDeposit(data.payload);
          // msg = `${sender} deposited batch of ${tokenIds.length} tokens of 1155 ${token}: [${values}]`;
          msg = depositNoticePayload("depositERC1155Batch", tokenIds, token);
      }
      app.createNotice({
        payload: msg as any,
      });
      return "accept";
    } catch (error) {
      console.error("Error processing command:", error);
      return "reject";
    }
  };
  app.addAdvanceHandler(handler);
};

const withdrawTokens = async (args: BasicArgs): Promise<"accept" | "reject"> => {
  const { inputArgs, app, wallet, metadata } = args;
  try {
    const { tokenAddress, withdrawAmount } = inputArgs;
    app.createVoucher(
      wallet.withdrawERC20(tokenAddress, metadata.msg_sender, withdrawAmount)
    );
    app.createNotice({
      payload: toHex(
        `The account ${metadata.msg_sender} is withdrawing ${withdrawAmount} tokens of ${tokenAddress} at ${metadata.timestamp}.`
      ),
    });
    return Promise.resolve("accept");
  } catch (error) {
    console.error("Error processing command:", error);
    return Promise.resolve("reject");
  }
};

export const handlers = {
  withdrawTokens
}

export const abi = ([
  "function withdrawTokens(address tokenAddress, uint256 withdrawAmount)"
]);