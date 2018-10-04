// constants to distinguish between different lambda terms
const VAR = 0; // variable e.g. x, y, z
const ABS = 1; // lambda abstraction e.g. \x.t
const APP = 2; // application e.g. t1 t2

// A variable, stored as a De Bruijn index
class LambdaVariable{
    constructor(index){this.index = index;}

    // return the type of this lambda term (variable)
    getType(){
        return VAR;
    }
}

// A lambda abstraction
class LambdaAbstraction{
    constructor(term, label){this.term = term; this.label = label}

    // return the type of this lambda term (abstraction)
    getType(){
        return ABS;
    }
}

// An application of two lambda terms
class LambdaApplication{
    constructor(t1, t2){this.t1 = t1; this.t2 = t2}

    // return the type of this lambda term (application)
    getType(){
        return APP;
    }
}