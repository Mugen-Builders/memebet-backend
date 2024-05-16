import { describe, expect, test, beforeAll, beforeEach, afterAll } from "vitest";
import { GetContractReturnType, Address, Client, Abi, Hex, checksumAddress } from 'viem';
import waitOn from 'wait-on';
import { spawn } from 'child_process';
import { deployTokens, publicClient } from "./deploy_tokens";
import { createApp } from "@deroll/app";

const ROLLUP_SERVER = process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:8080/rollup";

describe("Integration tests", () => {
    let nonodoProcess: ReturnType<typeof spawn>;
    let tokenAdmin: Hex = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    let tt20: GetContractReturnType<Abi, Client, Address>;
    let tt721: GetContractReturnType<Abi, Client, Address>;
    const e18 = BigInt(1e18);

    let testUserToken: Hex = '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720';
    beforeAll(async () => {

        nonodoProcess = spawn('nonodo', [], {
            env: {
                ...process.env, // copy the parent process's environment variables
            },
        });

        nonodoProcess.stdout!.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        nonodoProcess.stderr!.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        nonodoProcess.on('error', (error) => {
            console.error(`spawn error: ${error}`);
        });

        await waitOn({ resources: [ROLLUP_SERVER], validateStatus: (status) => status === 404 });
        console.log('Nonodo is ready');
        const [_tt20, _tt721] = await deployTokens(tokenAdmin);
        tt20 = _tt20 as unknown as GetContractReturnType<Abi, Client, Address>;
        tt721 = _tt721 as unknown as GetContractReturnType<Abi, Client, Address>;
    });

    test("should operate the tokens normally", async () => {
        expect(tt20.read.balanceOf([tokenAdmin])).resolves.toBe(0n);
        expect(tt20.read.owner()).resolves.toBe(checksumAddress(tokenAdmin));
        await tt20.write.mint([tokenAdmin, 10000n * e18]); //10k tokens
        expect(tt20.read.balanceOf([tokenAdmin])).resolves.toBe(10000n * e18);


        // we can mint tokens for other users

        await tt20.write.mint([testUserToken, 1n * e18]); //1k tokens
        expect(tt20.read.balanceOf([testUserToken])).resolves.toBe(1n * e18);


        // --- 721

        expect(tt721.read.balanceOf([tokenAdmin])).resolves.toBe(0n);
        expect(tt721.read.owner()).resolves.toBe(checksumAddress(tokenAdmin));
        await tt721.write.safeMint([tokenAdmin]); //100 tokens
        expect(tt721.read.balanceOf([tokenAdmin])).resolves.toBe(1n);

        // we can mint tokens for other users
        await tt721.write.safeMint([testUserToken]); //100 tokens
        expect(tt721.read.balanceOf([testUserToken])).resolves.toBe(1n);

        // owners of 721 are of unique tokens
        expect(tt721.read.ownerOf([0n])).resolves.toBe(checksumAddress(tokenAdmin));
        expect(tt721.read.ownerOf([1n])).resolves.toBe(checksumAddress(testUserToken));

    });

    afterAll(() => {
        nonodoProcess.kill();
        console.log('Nonodo is stopped');
    });
});