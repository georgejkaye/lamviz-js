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

    prettyPrint(x){
        return this.index;
    }
}

// A lambda abstraction
class LambdaAbstraction{
    constructor(term, label){this.term = term; this.label = label}

    // return the type of this lambda term (abstraction)
    getType(){
        return ABS;
    }

    prettyPrint(x){

        if(x === undefined){
            x = 0;
        }

        if(x === 0){
            return "\u03BB" + this.label + ". " + this.term.prettyPrint(0);
        }

        return "(\u03BB" + this.label + ". " + this.term.prettyPrint(0) + ")";
    }
}

// An application of two lambda terms
class LambdaApplication{
    constructor(t1, t2){this.t1 = t1; this.t2 = t2}

    // return the type of this lambda term (application)
    getType(){
        return APP;
    }

    prettyPrint(x){

        if(x === undefined){
            x = 0;
        }

        if(x === 0){
            if(this.t1.getType() === ABS){
                return this.t1.prettyPrint(1) + " " + this.t2.prettyPrint(1);
            }

            return this.t1.prettyPrint(0) + " " + this.t2.prettyPrint(1);
        }

        return "(" + this.t1.prettyPrint(x) + " " + this.t2.prettyPrint(x+1) + ")";
    }
}