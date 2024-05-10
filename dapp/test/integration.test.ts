import { describe, expect, test, beforeAll, afterAll } from "vitest";
import { exec } from 'child_process';
import axios from 'axios';
import waitOn from 'wait-on';
import { spawn, ChildProcess } from 'child_process';
import exp from "constants";

const ROLLUP_SERVER = process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:8080/rollup";


//Warning: THIS WORKS ONLY IF WE UP THE NONODO MANUALLY!

describe("Integration Tests", () => {
    let serverProcess: ChildProcess;

    // Start the server before all tests
    beforeAll(async () => {
        serverProcess = spawn('nonodo', [], {
            env: {
                ...process.env, // copy the parent process's environment variables
            },
        });

        serverProcess.stdout!.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        serverProcess.stderr!.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        serverProcess.on('error', (error) => {
            console.error(`spawn error: ${error}`);
        });

        // Wait until the server is ready (404 means the endpoint exists)
        await waitOn({
            resources: [ROLLUP_SERVER],
            validateStatus: (status) => status === 404,
            timeout: 60000, // Set a timeout of 60 seconds
        });

        console.log('Nonodo is ready');
    });

    // Test case
    test("should create a validator function and run a full betting session", async () => {
        console.log('Running a full betting session');

        // Register a Validator Function
        const registerValidatorFunctionCommand = `sunodo send generic \
            --dapp=0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C \
            --chain-id=31337 \
            --rpc-url=http://127.0.0.1:8545 \
            --mnemonic-passphrase='test test test test test test test test test test test junk' \
            --input=0x796eed58636e6e0000000000000000000000000000000000000000000000000000000000746573745f66756e6374696f6e00000000000000000000000000000000000000`;

        await new Promise<void>((resolve, reject) => {
            exec(registerValidatorFunctionCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Register Validator Function error: ${error}`);
                    reject(error);
                    return;
                }
                console.log(`Register Validator Function stdout: ${stdout}`);
                console.error(`Register Validator Function stderr: ${stderr}`);
                resolve();
            });
        });

        // Create a Game
        const createGameCommand = `sunodo send generic \
            --dapp=0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C \
            --chain-id=31337 \
            --rpc-url=http://127.0.0.1:8545 \
            --mnemonic-passphrase='test test test test test test test test test test test junk' \
            --input=0x7fff3f773030303100000000000000000000000000000000000000000000000000000000637572696e7469610000000000000000000000000000000000000000000000007061726d65697261000000000000000000000000000000000000000000000000000000000000000000000000f795b3d15d47ac1c61bef4cc6469ebb2454c6a9b00000000000000000000000000000000000000000000000000000000638a2d8000000000000000000000000000000000000000000000000000000000638a3b90636e6e0000000000000000000000000000000000000000000000000000000000`;

        await new Promise<void>((resolve, reject) => {
            exec(createGameCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Create Game error: ${error}`);
                    reject(error);
                    return;
                }
                console.log(`Create Game stdout: ${stdout}`);
                console.error(`Create Game stderr: ${stderr}`);
                resolve();
            });
        });

        // Check Game Information
        const gameResponse = await axios.get('http://127.0.0.1:8080/inspect/games/getGame/1');
        console.log('Game Information:', gameResponse.data);
        // Decode reports' payloads
        const reports = gameResponse.data.reports.map((report: any) => {
            const utf8Payload = hexToUtf8(report.payload);
            return {
                ...report,
                payload: JSON.parse(utf8Payload)
            };
        });

        console.log('Decoded Reports:', reports);

        expect(gameResponse.status).toBe(200);

        expect(reports).toEqual([
            {
                payload: {
                    id: "0x1",
                    picks: ["curintia", "parmeira"],
                    startTime: "1670000000",
                    endTime: "1670003600",
                    fees: 2,
                    playerIds: [],
                    currentOdds: [
                        ["curintia", "0"],
                        ["parmeira", "0"]
                    ]
                }
            }
        ]);

        // Check individual fields
        const firstReportPayload = reports[0].payload;

        expect(firstReportPayload.id).toBe("0x1");
        expect(firstReportPayload.picks).toEqual(["curintia", "parmeira"]);
        expect(firstReportPayload.startTime).toBe("1670000000");

    }, 60000);


    // Stop the server after all tests
    afterAll(() => {
        serverProcess.kill();
        console.log('Nonodo is stopped');
    });
});

function hexToUtf8(hex: string): string {
    return Buffer.from(hex.replace(/^0x/, ''), 'hex').toString('utf8');
}