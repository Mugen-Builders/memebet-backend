/**
 * routes to manage the Governance instance 
 */

import { BasicArgs, HandlerFunction } from ".";

const addMember: HandlerFunction = async (args: BasicArgs) => {
    // @todo add member logic
    return "reject";
}

const removeMember: HandlerFunction = async (args: BasicArgs) => {
    // @todo remove member logic
    return "reject";
}

export const handlers = {
    addMember,
    removeMember
};

export const abi = [
    "function addMember(address)",
    "function removeMember(address)"
]