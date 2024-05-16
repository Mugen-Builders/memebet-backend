function bet(...args) {
    console.log("Validating bet", args);
    const it = args[0].keys();
    return it.next().value;
};
(()=>{ return bet})(); 