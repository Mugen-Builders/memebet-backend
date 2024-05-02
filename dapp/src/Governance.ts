import { Hex } from "viem";

// Manages votes, decisions, validations of actions
// used in the creation of new bet models
// Can we leverage the DSG for DAOs?
export default class Governance {
    members: Array<string>

    constructor(members: Array<string>) {
        this.members = members;
    }
    private static instance:Governance;

    public static getInstance(): Governance {
        if (!Governance.instance) {
            Governance.instance = new Governance(["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"]);
        }
        return Governance.instance;
    }

    isMember(address: string) {
        return this.members.includes(address.toLowerCase());
    }

    addMember(address: string, msgSender: string) {
        address.toLowerCase()
        if (this.isMember(msgSender.toLowerCase())) {
            if (!this.isMember(address)){
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