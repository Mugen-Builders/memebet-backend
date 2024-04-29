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
            //We need to check also if the address is a member, or else there will be duplicate members added.
            if(!this.isMember(address)){
            this.members.push(address);
            }
            else{
            throw new Error("This address is already a member");
            }
        } else {
            throw new Error("Only members can add new members");
        }
    }
}