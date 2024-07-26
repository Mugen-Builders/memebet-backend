import { describe, test, expect, beforeEach, vi } from 'vitest';
import Governance from "../src/Governance";

describe('Governance', () => {
    let governance = new Governance(["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]);

    beforeEach(() => {
        vi.resetModules();
    });

    test('should initialize with the correct default members', () => {
        expect(governance.isMember("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")).toBe(true);
        expect(governance.isMember("0x404")).toBe(false);
    });

    test('should add a new member successfully', () => {
        const newMember = "0x123456";
        const existingMember = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

        governance.addMember(newMember, existingMember);

        expect(governance.isMember(newMember)).toBeTruthy();
    });

    test('should not add an existing member', () => {
        const existingMember = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

        expect(() => governance.addMember(existingMember, existingMember)).toThrowError("This address is already a member");
    });

    test('should throw error when non-member tries to add a new member', () => {
        const nonMember = "0x171";
        const newMember = "0x122565";

        expect(() => governance.addMember(newMember, nonMember)).toThrowError("Only members can add new members");
    });

    test('should remove a member successfully', () => {
        const existingMember = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
        const memberToRemove = "0x123456r7";

        governance.addMember(memberToRemove, existingMember);
        governance.removeMember(memberToRemove, existingMember);

        expect(governance.isMember(memberToRemove)).toBe(false);
    });

    test('should throw error when non-member tries to remove a member', () => {
        const nonMember = "0x45679";
        const memberToRemove = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

        expect(() => governance.removeMember(memberToRemove, nonMember)).toThrowError("Only members can remove members");
    });

    test('should throw error when trying to remove a non-existing member', () => {
        const existingMember = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
        const nonExistingMember = "0x404";

        expect(() => governance.removeMember(nonExistingMember, existingMember)).toThrowError("This address is not a member");
    });
});
