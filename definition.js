/**
 * The definition of the lambda calculus, implemented in Javascript.
 * 
 * @author George Kaye
 */

/** Variable e.g. x, y, z */
const VAR = 0;
/** Lambda abstraction e.g. \x.t */
const ABS = 1;
/** Lambda application e.g. t1 t2 */
const APP = 2;

/** Class representing a lambda variable (stored as a de Bruijn index). */
class LambdaVariable{

    /**
     * Create a lambda variable.
     * @param {any} index - Which lambda abstraction this term refers to.
     * @param {string} label - The label this term is associated with.
     */
    constructor(index, label){
        this.index = index; 
        if(label !== ""){
            this.label = label
        } else {
            this.label = index.toString();
        }
    }

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

    /**
     * Get a pretty print of this term using the actual labels.
     * @param {Object} env - The environment of this lambda term.
     * @param {number} x - The layer this term is at - determines whether brackets are required.
     * @return {string} The pretty string.
     */
    prettyPrintLabels(env, x){

        return this.label;
    }
}

/** Class representing a lambda abstraction. */
class LambdaAbstraction{

    /**
     * Create a lambda abstraction.
     * @param {Object}      t       - The scope of this lambda abstraction.
     * @param {string}      label   - The label this lambda abstraction has.
     */
    constructor(t, label){this.t = t; this.label = label}

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
            return "\u03BB " + this.t.prettyPrint(0);
        }

        return "(\u03BB " + this.t.prettyPrint(0) + ")";
    }

    /**
     * Get a pretty print of this term using the actual labels.
     * @param {Object} env  - The environment of this lambda term.
     * @param {number} x    - The layer this term is at - determines whether brackets are required.
     * @return {string} The pretty string.
     */
    prettyPrintLabels(env, x){

        if(env === undefined){
            env = new LambdaEnvironment();
        }

        if(x === undefined){
            x = 0;
        }

        env.pushTerm(this.label);

        var string = "";

        if(x === 0){
            string = "\u03BB" + this.label + ". " + this.t.prettyPrintLabels(env, 0);
        } else {
            string = "(\u03BB" + this.label + ". " + this.t.prettyPrintLabels(env, 0) + ")";
        }
        
        env.popTerm();
        return string;
    }
}

/** Class representing a lambda application. */
class LambdaApplication{

    /**
     * Create a lambda application.
     * @param {Object} t1 - the first term in the lambda application (the function).
     * @param {Object} t2 - the second term in the lambda application (the argument).
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

    /**
     * Get a pretty print of this term using the actual labels.
     * @param {Object} env  - The environment of this lambda term.
     * @param {number} x    - The layer this term is at - determines whether brackets are required.
     * @return {string} The pretty string.
     */
    prettyPrintLabels(env, x){

        if(env === undefined){
            env = new LambdaEnvironment();
        }

        if(x === undefined){
            x = 0;
        }

        if(x === 0){
            if(this.t1.getType() === ABS){
                return this.t1.prettyPrintLabels(env, 1) + " " + this.t2.prettyPrintLabels(env, 1);
            }

            return this.t1.prettyPrintLabels(env, 0) + " " + this.t2.prettyPrintLabels(env, 1);
        }

        return "(" + this.t1.prettyPrintLabels(env, x) + " " + this.t2.prettyPrintLabels(env, x+1) + ")";
    }
}

/** The terms encountered in the current environment.
 *  
 * (Used to ensure that there are no duplicates for graphing purposes)
 */
var termHistory = [];

/** Class representing an environment of currently abstracted variables. */
class LambdaEnvironment{

    /**
     * Create a new empty environment.
     */
    constructor(){this.env = []};

    /**
     * Get the length of this environment.
     * @return {number} The length of this environment.
     */
    length(){
        return this.env.length;
    }

    /**
     * Get the ith variable from this environment.
     * @param {number} i - The index of the variable to get.
     * @return {string} The ith variable.
     */
    get(i){
        return this.env[i];
    }

    /**
     * Push a new variable into the environment.
     * @param {string} variable - The variable to push into the environment.
     */
    pushTerm(variable){
        if(this.env[0] === ""){
            this.env[0] = variable;
        } else {
            this.env.push(variable);
        }
    }

    /**
     * Remove a term from the environment.
     */
    popTerm(){
        this.env.pop();
    }

    /**
     * Find the de Bruijn index of a variable - this might break if a variable name occurs more than once!
     * @param {string} variable - The variable to search for.
     * @returns {number} The de Bruijn index of the variable, or -1 if not found.
     */
    find(variable){

        var j = -1;

        for(i = this.env.length - 1; i >= 0; i--){

            j++;

            if(this.env[i] === variable){
                return j;
            }
        }

        return -1;

    }

    /**
     * Get the name of a variable with a certain de Bruijn index.
     * @param {number} index - The index to determine the variable name from
     * @return {string} The name of the variable (? if could not be found)
     */
    determine(index){

        if(index < 0 || this.env.length - 1 - index < 0){
            return "?";
        }

        return this.env[this.env.length - 1 - index];

    }

    /**
     * Pretty print this environment.
     * @return {string} A pretty version of this environment.
     */
    prettyPrint(){

        var string = "";

        for(var i = 0; i < this.env.length; i++){
            string += this.env[i] + ", "
        }

        return string.substring(0, string.length - 2);
    }
}