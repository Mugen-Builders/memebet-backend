/**
 * routes to manage the Governance instance 
 */


import { toHex } from "viem";
import { BasicArgs, HandlerFunction } from ".";

const addMember: HandlerFunction = async (args: BasicArgs) => {
    const { inputArgs, metadata ,governance, app}  = args;
    const address = inputArgs;
    try {
        governance.addMember(address, metadata.msg_sender)
        app.createNotice({payload: toHex("Member added sucessfully!")})
        return "accept";
    } catch (error) {
        app.createReport({ payload: toHex("Failed to Add Member!") })
        return "reject";
    }
}

const removeMember: HandlerFunction = async (args: BasicArgs) => {
    const { inputArgs, metadata, governance, app } = args;
    const address = inputArgs;
    try {
        governance.removeMember(address, metadata.msg_sender)
        app.createNotice({ payload: toHex("Member removed sucessfully!") })
        return "accept";
    } catch (error) {
        app.createReport({ payload: toHex("Failed to remove member!") })
        return "reject";
    }
}

export const handlers = {
    addMember,
    removeMember
};

export const abi = [
    "function addMember(address)",
    "function removeMember(address)"
]