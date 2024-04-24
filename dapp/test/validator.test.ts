
import { describe, expect, test, beforeAll } from "vitest";
import { hashMessage, createWalletClient, http, WalletClient, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts"
import { mainnet } from "viem/chains";

import { ValidatorManager, ValidatorFunctionRunner, DAOSignatureBlobChecker } from "../src/validator";
import Governance from "../src/Governance";
import { Bet, VFR, PlayerBet } from "../src/types";

// describe("ValidatorManager", () => {})


describe("DAOSignatureBlobChecker", () => {
    const privateTestKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const publicTestKey = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    let wallet: WalletClient
    let account: PrivateKeyAccount
    beforeAll(() => {
        account = privateKeyToAccount(privateTestKey);
        wallet = createWalletClient({ account, chain: mainnet, transport: http() });
    });

    test("should verify a signature", async () => {
        const governance = new Governance([publicTestKey]);
        const checker = new DAOSignatureBlobChecker(governance);
        const data = "test data";
        const hash = hashMessage(data);
        const signature = await wallet.signMessage({ account, message: data });
        expect(checker.verify(hash, signature)).resolves.toBe(true);
    });

    test("should not verify a signature", async () => {
        const secondPubKey = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const governance = new Governance([secondPubKey]);
        const checker = new DAOSignatureBlobChecker(governance);
        const data = "test data 123";
        const hash = hashMessage(data);
        const signature = await wallet.signMessage({ account, message: data });
        expect(checker.verify(hash, signature)).resolves.toBe(false);
    })
});


describe("ValidatorFunctionRunner", () => {
    const privateTestKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const publicTestKey = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    let wallet: WalletClient
    let account: PrivateKeyAccount
    let governance: Governance
    let checker: DAOSignatureBlobChecker

    beforeAll(() => {
        account = privateKeyToAccount(privateTestKey);
        wallet = createWalletClient({ account, chain: mainnet, transport: http() });
        governance = new Governance([publicTestKey]);
        checker = new DAOSignatureBlobChecker(governance);
    });

    test("should run a validator function", () => {
        const checkers = new Map();
        const emptyPicks: Map<string, Bet[]> = new Map();
        const data = "test data";
        const temp = `
            (...args) => {
                return "true";
            }
        `;
        const runner = new ValidatorFunctionRunner(temp, checker);
        expect(runner.run(emptyPicks, [], data)).toBe("true");
    });

    test("should run a validator function and return basic pick", () => {
        const checkers = new Map();
        const picks: Map<string, Bet[]> = new Map();
        picks.set("test_pick", [{ pick: "test", player: "test", tokenAddress: "test", amount: BigInt(0) }]);
        picks.set("test_pick2", [{ pick: "test2", player: "test2", tokenAddress: "test2", amount: BigInt(0) }]);
        const data = "test data";
        const temp = `
            (...args) => {
                const [picks, bets, data] = args;
                console.log(args);
                return picks.keys().next().value;
            }
        `;
        const runner = new ValidatorFunctionRunner(temp, checker);
        expect(runner.run(picks, [], data)).toBe("test_pick");
    });

    test("should run a validator function and use dao checker", async () => {
        const checkers = new Map();
        const picks: Map<string, Bet[]> = new Map();
        picks.set("test_pick", [{ pick: "test", player: "test", tokenAddress: "test", amount: BigInt(0) }]);
        picks.set("test_pick2", [{ pick: "test2", player: "test2", tokenAddress: "test2", amount: BigInt(0) }]);
        const data = "test data";
        const hash = hashMessage(data);
        const signature = await wallet.signMessage({ account, message: data });
        const temp = `
            async (...args) => {
                const viem = require("viem");
                const [picks, bets, data, signature, checkers] = args;
                const hash = viem.hashMessage(data);
                const checker = checkers.get("dao_checker");
                if(await checker.verify(hash, signature)) {
                    return picks.keys().next().value;
                }
                throw new Error("Failed to verify dao signature");
            }
        `;
        checkers.set("dao_checker", checker);
        const runner = new ValidatorFunctionRunner(temp, checker);
        expect(runner.run(picks, [], data, signature)).resolves.toBe("test_pick");
    });

    test("should run a validator function and fail to verify dao signature", async () => {
        const checkers = new Map();
        const picks: Map<string, Bet[]> = new Map();
        picks.set("test_pick", [{ pick: "test", player: "test", tokenAddress: "test", amount: BigInt(0) }]);
        picks.set("test_pick2", [{ pick: "test2", player: "test2", tokenAddress: "test2", amount: BigInt(0) }]);
        const data = "test data";
        const alterateData = "test data 123";
        const hash = hashMessage(data);
        const signature = await wallet.signMessage({ account, message: data });
        const temp = `
            async (...args) => {
                const viem = require("viem");
                const [picks, bets, data, signature, checkers] = args;
                const hash = viem.hashMessage(data);
                const checker = checkers.get("dao_checker");
                if(await checker.verify(hash, signature)) {
                    return picks.keys().next().value;
                }
                throw new Error("Failed to verify dao signature");
            }
        `;
        checkers.set("dao_checker", checker);
        const runner = new ValidatorFunctionRunner(temp, checker);
        expect(runner.run(picks, [], alterateData, signature)).rejects.toThrow("Failed to verify dao signature");
    });
});