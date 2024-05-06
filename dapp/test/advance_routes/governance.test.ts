import { describe, test, expect, beforeEach, vi, beforeAll } from 'vitest';
import { MockedObjectDeep } from '@vitest/spy';
import { AdvanceRequestData, Bet } from "../../src/types";
import { Hex, toHex, fromHex } from 'viem';
import * as governanceRoutes from "../../src/advance/governance";

import { createApp } from "@deroll/app";
import { App } from "@deroll/core";
import { WalletApp, createWallet } from '@deroll/wallet';
import AppManager from '../../src/AppManager';
import Governance from '../../src/Governance';

const {
    addMember,
    removeMember,
} = governanceRoutes.handlers;

describe('Governance Routes', () => {
    let app: MockedObjectDeep<App>;
    let wallet: MockedObjectDeep<WalletApp>;
    let appManager: MockedObjectDeep<AppManager>;
    let governance: MockedObjectDeep<Governance>;
    let basicMetadata: AdvanceRequestData["metadata"];

    beforeAll(() => {
        app = vi.mocked(createApp({ url: "http://127.0.0.1:8080/rollup" }), { deep: true });
        wallet = vi.mocked(createWallet(), { deep: true });
        appManager = vi.mocked(AppManager.getInstance(), { deep: true });
        governance = vi.mocked(Governance.getInstance(), { deep: true });
        basicMetadata = {
            msg_sender: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            epoch_index: 10,
            input_index: 10,
            block_number: 100,
            timestamp: Date.now()
        };
        vi.mocked(governance.addMember("0x1234",basicMetadata.msg_sender), { deep: true });
    });

    beforeEach(() => {
        vi.clearAllMocks(); // cleans the history of mocks
    });

    test('[addMember] should add a member in governance successfully', async () => {
        app.createNotice = vi.fn();
        app.createReport = vi.fn();
        governance.addMember = vi.fn();
        governance.isMember = vi.fn();
        const inputArgs = "0x999888777";

        const res = await addMember({
            inputArgs,
            app,
            wallet,
            metadata: basicMetadata,
            appManager,
            governance
        });

        expect(governance.addMember).toHaveBeenCalledWith("0x999888777", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
        expect(app.createNotice).toHaveBeenCalledWith({ payload: toHex("Member added sucessfully!") });
        expect(res).toBe("accept");
    });

    test('[removeMember] should add a remove a member in governance successfully', async () => {
        app.createNotice = vi.fn();
        app.createReport = vi.fn();
        governance.removeMember = vi.fn();
        const inputArgs = "0x1234";

        const res = await removeMember({
            inputArgs,
            app,
            wallet,
            metadata: basicMetadata,
            appManager,
            governance
        });

        expect(governance.removeMember).toHaveBeenCalledWith("0x1234", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
        expect(app.createNotice).toHaveBeenCalledWith({ payload: toHex("Member removed sucessfully!") });
        expect(res).toBe("accept");
    });

});
