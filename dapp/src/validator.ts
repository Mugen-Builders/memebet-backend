import { recoverAddress, Hex } from "viem";

import { VFR } from "./types";
import { DAOSignatureBlobChecker } from "./DAOSignatureBlobChecker";
import Governance from "./Governance";

// Hanldes the creation and listing of new validator functions
// Creation should be done by DAO only
export class ValidatorManager {

    functions: Map<string, ValidatorFunctionRunner>;
    daoSigChecker: DAOSignatureBlobChecker;

    private constructor() {
        this.functions = new Map();
        this.daoSigChecker = new DAOSignatureBlobChecker(Governance.getInstance());
    }
    private static instance: ValidatorManager;
    public static getInstance(): ValidatorManager {
        if (!ValidatorManager.instance) {
            ValidatorManager.instance = new ValidatorManager();
        }
        return ValidatorManager.instance;
    }
    createNewValidator(name: string, functionString: string) {
        const fn = new ValidatorFunctionRunner(functionString, this.daoSigChecker);
        this.functions.set(name, fn);
    }

    getValidator(name: string) {
        return this.functions.get(name);
    }

    getValidators() {
        return this.functions.entries();
    }

    getAllFunctionNames(): string[] {
        return Array.from(this.functions.keys());
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