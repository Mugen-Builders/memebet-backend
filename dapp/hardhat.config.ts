import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

let mnemonic = process.env.MNEMONIC;

const config: HardhatUserConfig = {
    solidity: "0.8.24",

    networks: {
        localhost: {
            url: process.env.RPC_URL || "http://localhost:8545",
            accounts: mnemonic ? { mnemonic } : undefined,
        },
    }
};

export default config;