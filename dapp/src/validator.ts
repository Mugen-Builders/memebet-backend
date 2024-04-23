import { VFR } from "./types";

// Hanldes the creation and listing of new validator functions
// Creation should be done by DAO only
export class ValidatorManager {

}

// It takes a string with a JS function and 
// injects all dependencies, runs it and returns
// controlled results
export class ValidatorFunctionRunner {
    _function: VFR;
    
    constructor(functionString:string) {
        this._function = eval(`"use strict";` + functionString);
    }

    run: VFR = (...args) => {
        return this._function(...args);
    }

}


// First data authenticity checker
// Ensures data is trustworthy and hasn't been manipulated
// Sets a standard to be extended by later by 
// TLS checker, Blockchain checker and others
export class DAOSignatureBlobChecker {

}