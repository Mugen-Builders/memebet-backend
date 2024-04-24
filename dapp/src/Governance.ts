import { Hex } from "viem";

// Manages votes, decisions, validations of actions
// used in the creation of new bet models
// Can we leverage the DSG for DAOs?
export default class Governance {
    members: Array<Hex>

    constructor(members: Array<Hex>) {
        this.members = members;
    }

    isMember(address: Hex) {
        return this.members.includes(address);
    }

    addMember(address: Hex, msgSender: Hex) {
        if (this.isMember(msgSender)) {
            this.members.push(address);
        } else {
            throw new Error("Only members can add new members");
        }
    }
}