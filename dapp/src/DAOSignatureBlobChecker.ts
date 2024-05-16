// First data authenticity checker
// Ensures data is trustworthy and hasn't been manipulated
// Sets a standard to be extended by later by 
// TLS checker, Blockchain checker and others

import { Hex, recoverAddress } from "viem";
import Governance from "./Governance";

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