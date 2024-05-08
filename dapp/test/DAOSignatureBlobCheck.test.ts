
import { describe, expect, test, beforeAll, beforeEach } from "vitest";
import { hashMessage, createWalletClient, http, WalletClient, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts"
import { mainnet } from "viem/chains";
import { DAOSignatureBlobChecker } from "../src/DAOSignatureBlobChecker";
import Governance from "../src/Governance";


describe("DAOSignatureBlobChecker", () => {
    const privateTestKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const publicTestKey = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
    let wallet: WalletClient
    let account: PrivateKeyAccount
    beforeAll(() => {
        account = privateKeyToAccount(privateTestKey);
        wallet = createWalletClient({ account, chain: mainnet, transport: http() });
        process.env.GOVERNANCE_TEST = 'true';
    });

    beforeEach(()=>{
        Governance._resetInstance();
    })

    test("should verify a signature", async () => {
        const governance = new Governance([publicTestKey]); 
        const checker = new DAOSignatureBlobChecker(governance);
        const data = "test data";
        const hash = hashMessage(data);
        const signature = await wallet.signMessage({ account, message: data });
        expect(checker.verify(hash, signature)).resolves.toBe(true);
        Governance._resetInstance();
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

    test("should handle null or undefined hash and signature", async () => {
        //@DEV this test makes little sense in the TS context
        const governance = new Governance([publicTestKey]);
        const checker = new DAOSignatureBlobChecker(governance);
        await expect(checker.verify(null, "alice_signature_123")).rejects.toThrow();
        await expect(checker.verify("hash_123", null)).rejects.toThrow();
    });

    test("should consistently verify the same signature", async () => {
        const governance = new Governance([publicTestKey]);
        const checker = new DAOSignatureBlobChecker(governance);
        const data = "cata_123";
        const hash = hashMessage(data);
        const signature = await wallet.signMessage({ account, message: data });
        const firstAttempt = await checker.verify(hash, signature);
        const secondAttempt = await checker.verify(hash, signature);
        expect(firstAttempt).toBe(secondAttempt);
    });

    test("should verify a signature when multiple members are in governance", async () => {
        const multipleMembers = [publicTestKey, "0xAnotherMemberKey"];
        const governance = new Governance(multipleMembers);
        const checker = new DAOSignatureBlobChecker(governance);
        const data = "multi-member data";
        const hash = hashMessage(data);
        const signature = await wallet.signMessage({ account, message: data });
        expect(await checker.verify(hash, signature)).toBe(true);
    });

    test("should not verify any signature if governance list is empty", async () => {
        const governance = new Governance([]);
        const checker = new DAOSignatureBlobChecker(governance);
        const data = "data_123";
        const hash = hashMessage(data);
        const signature = await wallet.signMessage({ account, message: data });
        expect(await checker.verify(hash, signature)).toBe(false);
    });

    test("should fail verification if data is altered", async () => {
        const governance = new Governance([publicTestKey]);
        const checker = new DAOSignatureBlobChecker(governance);
        const originalData = "original_data";
        const alteredData = "corrupted_or_malicious_data";
        const originalHash = hashMessage(originalData);
        const signature = await wallet.signMessage({ account, message: originalData });
        expect(await checker.verify(originalHash, signature)).toBe(true);
        const alteredHash = hashMessage(alteredData);
        expect(await checker.verify(alteredHash, signature)).toBe(false);
    });

    test("should not verify a signature from a non-member", async () => {
        const nonMemberPubKey = "0x123456789abcdef";
        const governance = new Governance([nonMemberPubKey]);
        const checker = new DAOSignatureBlobChecker(governance);
        const data = "important data";
        const hash = hashMessage(data);
        const fakeSignature = await wallet.signMessage({ account, message: data });
        expect(await checker.verify(hash, fakeSignature)).toBe(false);
    });
});
