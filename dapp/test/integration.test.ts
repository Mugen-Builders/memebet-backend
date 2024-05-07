import { describe, expect, test, beforeAll, beforeEach, afterAll } from "vitest";
import { exec } from 'child_process';
import axios from 'axios';
import waitOn from 'wait-on';
import { spawn } from 'child_process';

const ROLLUP_SERVER = process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:8080/rollup";

describe("ValidatorFunctionRunner", () => {
    let serverProcess: ReturnType<typeof spawn>;

    beforeAll(async () => {
        serverProcess = spawn('/home/teste/go/bin/nonodo', [], {
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

        await waitOn({ resources: [ROLLUP_SERVER], validateStatus: (status) => status === 404});
        console.log('Nonodo is ready');
    });

    test("should run a full betting session", async () => {
        console.log('Running a full betting session');
    });

    afterAll(() => {
        serverProcess.kill();
        console.log('Nonodo is stopped');
    });
});