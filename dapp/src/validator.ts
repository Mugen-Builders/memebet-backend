import { recoverAddress, Hex } from "viem";

import { VFR } from "./types";
import Governance from "./Governance";

// Hanldes the creation and listing of new validator functions
// Creation should be done by DAO only
export class ValidatorManager {

    functions: Map<string, VFR>;

    constructor() {
        this.functions = new Map();
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


// First data authenticity checker
// Ensures data is trustworthy and hasn't been manipulated
// Sets a standard to be extended by later by 
// TLS checker, Blockchain checker and others
export class DAOSignatureBlobChecker {
    _governance: Governance;

    constructor(governance: Governance) {
        this._governance = governance;
    }

    async verify(hash: Hex, signature:Hex) {
        const recoveredAddress = await recoverAddress({ hash, signature});
        return this._governance.isMember(recoveredAddress);
    }

}