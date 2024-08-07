import { describe, expect, test, beforeAll, beforeEach } from "vitest";
import { hashMessage, createWalletClient, http, WalletClient, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts"
import { mainnet } from "viem/chains";

import { ValidatorFunctionRunner, ValidatorManager } from "../src/validator";
import { DAOSignatureBlobChecker } from "../src/DAOSignatureBlobChecker";
import Governance from "../src/Governance";
import { Bet, VFR } from "../src/types";

describe("ValidatorFunctionRunner", () => {
    const privateTestKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const publicTestKey = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
    let wallet: WalletClient;
    let account: PrivateKeyAccount;
    let governance: Governance;
    let checker: DAOSignatureBlobChecker;

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
        expect(runner.run(emptyPicks, data, "0x00")).toBe("true");
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
                return picks.keys().next().value;
            }
        `;
        const runner = new ValidatorFunctionRunner(temp, checker);
        expect(runner.run(picks, data, "0x00")).toBe("test_pick");
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
                const [picks, data, signature, checkers] = args;
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
        expect(runner.run(picks, data, signature)).resolves.toBe("test_pick");
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
                const [picks, data, signature, checkers] = args;
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
        expect(runner.run(picks, alterateData, signature)).rejects.toThrow("Failed to verify dao signature");
    });

    test("should run asynchronous validator functions", async () => {
        const temp = `async (...args) => { return "async result"; }`;
        const runner = new ValidatorFunctionRunner(temp, checker);
        await expect(runner.run(new Map(), "data", "0x00")).resolves.toBe("async result");
    });

});

describe('ValidatorManager', () => {
    let manager: ValidatorManager;
    const testValidatorFunction = "async () => 'test_result'";

    beforeAll(() => {
        manager = ValidatorManager.getInstance();
    });

    beforeEach(() => {
        // Clear the validators map before each test
        manager.functions = new Map();
    });

    test('should create a new validator', () => {
        manager.createNewValidator('test_validator', `async (...args) => 'test_result'`);
        expect(manager.functions.size).toBe(1);
    });

    test('should get an existing validator', () => {
        manager.createNewValidator('existing_validator', `async (...args) => 'test_result'`);
        const validator = manager.getValidator('existing_validator');
        expect(validator).not.toBeNull();
    });

    test('should list all validators', () => {
        const validators = new Map([
            ['validator1', testValidatorFunction],
            ['validator2', "async () => 'validator2_result'"],
        ]);

        // Adding multiple validators
        validators.forEach((fn, name) => {
            manager.createNewValidator(name, fn);
        });

        const listedValidators = Array.from(manager.getValidators());

        expect(listedValidators.length).toBe(validators.size);
    });

    test('should get all function names', () => {
        const validators = ['validator1', 'validator2'];

        // Adding multiple validators
        validators.forEach(name => {
            manager.createNewValidator(name, `async (...args) => '${name}_result'`);
        });

        const functionNames = manager.getAllFunctionNames();

        expect(functionNames).toEqual(validators);
    });
});
