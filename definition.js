/** Constants to distinguish between different lambda terms. */
const VAR = 0; // variable e.g. x, y, z
const ABS = 1; // lambda abstraction e.g. \x.t
const APP = 2; // application e.g. t1 t2

/** Class representing a lambda variable (currently stored as a string - TODO De Bruijn). */
class LambdaVariable{

    /**
     * Create a lambda variable.
     * @param {anything} index - Which lambda abstraction this term refers to.
     */
    constructor(index){this.index = index;}

    /**
     * Get the type of this lambda term - a variable.
     * @return {number} The type of this lambda term.
     */
    getType(){
        return VAR;
    }

    /**
     * Get a pretty print of this term.
     * @param {number} x - The layer this term is at - determines whether brackets are required.
     * @return {string} The pretty string.
     */
    prettyPrint(x){
        return this.index;
    }
}

/** Class representing a lambda abstraction. */
class LambdaAbstraction{

    /**
     * Create a lambda abstraction.
     * @param {lambda term} term    - The scope of this lambda abstraction.
     * @param {string}      label   - The label this lambda abstraction has.
     */
    constructor(term, label){this.term = term; this.label = label}

    /**
     * Get the type of this lambda term - an abstraction.
     * @return {number} The type of this lambda term.
     */
    getType(){
        return ABS;
    }

    /**
     * Get a pretty print of this term.
     * @param {number} x - The layer this term is at - determines whether brackets are required.
     * @return {string} The pretty string.
     */
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

/** Class representing a lambda application. */
class LambdaApplication{

    /**
     * Create a lambda application.
     * @param {lambda term} t1 - the first term in the lambda application (the function).
     * @param {lambda term} t2 - the second term in the lambda application (the argument).
     */
    constructor(t1, t2){this.t1 = t1; this.t2 = t2}

    /**
     * Get the type of this lambda term - an application.
     * @return {number} The type of this lambda term.
     */
    getType(){
        return APP;
    }

    /**
     * Get a pretty print of this term.
     * @param {number} x - The layer this term is at - determines whether brackets are required.
     * @return {string} The pretty string.
     */
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