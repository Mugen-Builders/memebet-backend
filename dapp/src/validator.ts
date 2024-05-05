import { recoverAddress, Hex } from "viem";

import { VFR } from "./types";
import { DAOSignatureBlobChecker } from "./DAOSignatureBlobChecker";

// Hanldes the creation and listing of new validator functions
// Creation should be done by DAO only
export class ValidatorManager {

    functions: Map<string, VFR>;

    private constructor() {
        this.functions = new Map();
    }
    private static instance: ValidatorManager;
    public static getInstance(): ValidatorManager {
        if (!ValidatorManager.instance) {
            ValidatorManager.instance = new ValidatorManager();
        }
        return ValidatorManager.instance;
    }
    createNewValidator(name: string, fn: VFR) {
        this.functions.set(name, fn);
    }

    getValidator(name: string) {
        return this.functions.get(name);
    }

    getValidators() {
        return this.functions.entries();
    }

}

// It takes a string with a JS function and 
// injects all dependencies, runs it and returns
// controlled results
export class ValidatorFunctionRunner {
    _function: (...args: any[]) => Promise<string>;
    checkers = new Map();
    
    constructor(functionString:string, daoSigChecker: DAOSignatureBlobChecker) {
        this._function = eval(`"use strict";` + functionString);
        this.checkers.set("dao_checker", daoSigChecker);
    }

    run: VFR = (...args) => {
        return this._function(...args, this.checkers);
    }

}