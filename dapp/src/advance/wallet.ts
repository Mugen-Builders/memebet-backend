import { toHex } from "viem";

import { BasicArgs } from "./index";


const depositTokens = async (args: BasicArgs) => {
  const { inputArgs, app, wallet, metadata } = args;
  try {
    const { tokenAddress, to, depositAmount } = inputArgs;
    wallet.transferERC20(tokenAddress, metadata.msg_sender, to, depositAmount);
    app.createNotice({
      payload: toHex(
        `The account ${metadata.msg_sender} is transferring ${depositAmount} tokens ${tokenAddress} from ${metadata.msg_sender} to ${to} at ${metadata.timestamp}`
      ),
    });
    return "accept";
  } catch (error) {
    console.error("Error processing command:", error);
    return "reject";
  }
};

const withdrawTokens = async (args: BasicArgs) => {
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
  depositTokens,
  withdrawTokens
}


export const abi = [
  "function depositTokens(address tokenAddress, address to, uint256 depositAmount)",
  "function withdrawTokens(address tokenAddress, uint256 withdrawAmount)"
]