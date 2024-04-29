import { describe, expect, test } from "vitest";
import Governance from "../src/Governance";

describe("Governance", () => {
    test("isMember", async () => {
        const governance = new Governance(["0x1234"]);
        expect(await governance.isMember("0x1234")).toBeTruthy();
    });
    test("addMember", async () => {
        const governance = new Governance(["0x1234"]);
        governance.addMember("0x5678", "0x1234");
        expect(await governance.isMember("0x5678")).toBeTruthy();
    });

    test("addMember throws with non-member", async () => {
        const governance = new Governance(["0x1234"]);
        expect(() => governance.addMember("0x5678", "0x5678")).toThrow("Only members can add new members");
    });

    test("isMember returns false for non-member", async () => {
        const governance = new Governance(["0x1234"]);
        expect(await governance.isMember("0x5678")).toBeFalsy();
    });

    test("handles empty initial member list", async () => {
        const governance = new Governance([]);
        expect(await governance.isMember("0x1234")).toBeFalsy();
    });

    test("dont add duplicate members", async () => {
        const governance = new Governance(["0x1234"]);
        expect(() => governance.addMember("0x1234", "0x1234")).toThrow("This address is already a member");
    });
});