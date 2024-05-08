import { Hex } from "viem";

// Manages votes, decisions, validations of actions
// used in the creation of new bet models
// Can we leverage the DSG for DAOs?
export default class Governance {
    members: Array<string>

    constructor(members: Array<string>) {
        if (Governance.instance) throw new Error("There is already an active Governance instance");
        this.members = members;
        Governance.instance = this;
    }
    private static instance: Governance;

    public static getInstance(): Governance {
        return Governance.instance;
    }

    isMember(address: string) {
        return this.members.includes(address.toLowerCase());
    }

    addMember(address: string, msgSender: string) {
        address.toLowerCase()
        if (this.isMember(msgSender.toLowerCase())) {
            if (!this.isMember(address)) {
                this.members.push(address);
            }
            else {
                throw new Error("This address is already a member");
            }
        } else {
            throw new Error("Only members can add new members");
        }
    }

    removeMember(address: string, msgSender: string): void {
        address = address.toLowerCase();
        msgSender = msgSender.toLowerCase();

        if (this.isMember(msgSender)) {
            const index = this.members.indexOf(address);
            if (index !== -1) {
                this.members.splice(index, 1);
            } else {
                throw new Error("This address is not a member");
            }
        } else {
            throw new Error("Only members can remove members");
        }
    }

    // @DEV this is a test helper
    public static _resetInstance():void {
        if(process.env.GOVERNANCE_TEST === 'true') {
            Governance.instance = undefined as unknown as Governance;
            return;
        }
        throw new Error("Method not allowed");
    }
}