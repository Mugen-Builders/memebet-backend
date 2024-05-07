import { fromHex, toHex } from "viem";
import { BasicArgs, HandlerFunction } from ".";
import { ValidatorFunctionRunner } from "../validator";


const addValidationFunction: HandlerFunction = async (args: BasicArgs) => {
    const { inputArgs, app, metadata, governance, validatorManager } = args;
    //check if the user is a member of DAO
    if (!governance.isMember(metadata.msg_sender)) {
        app.createReport({ payload: toHex("You are not a member of DAO!") })
        return "reject";
    }
    const [functionName, functionCode] = inputArgs; //@TODO: check if we need to unhex functionCode
    const name = fromHex(functionName, 'string');

    validatorManager.createNewValidator(name,functionCode);
    app.createNotice({ payload: toHex(`Validator ${name} added sucessfully!`) });
    return "accept";
};

export const handlers = {
    addValidationFunction,
};

export const abi = [
    "function addValidationFunction(bytes32 name, string function)"
]