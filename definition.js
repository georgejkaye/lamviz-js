/** Constants to distinguish between different lambda terms. */
const VAR = 0; // variable e.g. x, y, z
const ABS = 1; // lambda abstraction e.g. \x.t
const APP = 2; // application e.g. t1 t2

var termHistory = [];

/** Class representing a lambda variable (stored as a de Bruijn index). */
class LambdaVariable{

    /**
     * Create a lambda variable.
     * @param {any} index - Which lambda abstraction this term refers to.
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

    /**
     * Get a pretty print of this term using the actual labels.
     * @param {Object} env - The environment of this lambda term.
     * @param {number} x - The layer this term is at - determines whether brackets are required.
     * @return {string} The pretty string.
     */
    prettyPrintLabels(env, x){

        if(env === undefined){
            env = new LambdaEnvironment();
        }

        return env.determine(this.index);
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
            return "\u03BB" + ". " + this.t.prettyPrint(0);
        }

        return "(\u03BB" + ". " + this.t.prettyPrint(0) + ")";
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

/** Class representing an environment of currently abstracted variables. */
class LambdaEnvironment{

    /**
     * Create a new empty environment.
     */
    constructor(){this.env = [], this.envUnique = [], termHistory = []};

    /**
     * Push a new variable into the environment. If the element already exists, appends a prime to it (e.g. x -> x').
     * @param {string} variable - The variable to push into the environment.
     * @return {string} The name of the variable as it appears in the 'unique names' environment.
     */
    pushTerm(variable){
        if(this.env[0] === ""){
            this.env[0] = variable;
        } else {
            this.env.push(variable);
        }

        var i = 0;

        while(i < termHistory.length){
            if(termHistory[i] === variable){
                variable += "\'";
                i = 0;
            } else {
                i++;
            }
        }

        if(this.envUnique[0] === ""){
            this.envUnique[0] = variable;
        } else {
            this.envUnique.push(variable);
        }

        if(termHistory[0] === ""){
            termHistory[0] = variable;
        } else {
            termHistory.push(variable);
        }

        return variable;
    }

    /**
     * Remove a term from the environment.
     */
    popTerm(){
        this.env.pop();
        this.envUnique.pop();
    }

    /**
     * Find the de Bruijn index of a variable.
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

        if(this.envUnique.length - 1 - index < 0){
            return "?";
        }

        return this.envUnique[this.envUnique.length - 1 - index];

    }
}