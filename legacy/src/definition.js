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

/** The number of reduction steps to perform before halting operations. */
const maximumPathLength = 5000;

/** Constants to represent different modes */
const MAX = 0;
const MIN = 1;
const MEAN = 2;
const MODE = 3;
const MEDIAN = 4;

var currentVariableIndex = 0;
const variableNames = ['x', 'y', 'z', 'w', 'u', 'v', 't', 'p', 'q', 'r', 's', 'm', 'n', 'o', '\u03D5', '\u03C8', '\u03C9'];

var currentFreeVariableIndex = 0;
const freeVariableNames = ['a', 'b', 'c', 'd', 'e'];

var loop = false;

/**
 * Reset the variable indices to start from x, y, z...
 */
function resetVariableIndices(){
    currentVariableIndex = 0;
    currentFreeVariableIndex = 0;
}

/**
 * Get the next variable name in the list of variable names, appending a ' if the list is looped.
 * @return {string} The next variable name.
 */
function getNextVariableName(){

    var index = currentVariableIndex % variableNames.length;
    var name = variableNames[index];

    for(var i = 0; i < Math.floor(currentVariableIndex / variableNames.length); i++){
        name += "\'";
    }

    currentVariableIndex++;

    return name;

}

/**
 * Get the next variable name in the list of variable names, appending a ' if the list is looped.
 * @return {string} The next variable name.
 */
function getNextFreeVariableName(){

    var index = currentFreeVariableIndex % freeVariableNames.length;
    var name = freeVariableNames[index];

    for(var i = 0; i < Math.floor(currentFreeVariableIndex / freeVariableNames.length); i++){
        name += "\'";
    }

    currentFreeVariableIndex++;

    return name;

}

/** Class representing a lambda variable (stored as a de Bruijn index). */
class LambdaVariable{

    /**
     * Create a lambda variable.
     * @param {number} index - Which lambda abstraction this term refers to.
     * @param {string} alias - The alias this term is associated with.
     */
    constructor(index, alias, id){

        if(alias === undefined){
            alias = "";
        }

        this.index = index;
        this.alias = alias;
        this.id = id;

        this.print = this.prettyPrint();
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
     * @param {number} x    - The layer this term is at - determines whether brackets are required.
     * @return {string} The pretty string.
     */
    prettyPrint(x){
        return this.index;
    }

    /**
     * Get a pretty print of this term using the actual labels.
     * @param {Object} ctx  - The context of this lambda term.
     * @param {number} x    - The layer this term is at - determines whether brackets are required.
     * @return {string} The pretty string.
     */
    prettyPrintLabels(ctx, x){

        if(this.alias !== ""){
            return this.alias;
        }

        return ctx.getCorrespondingVariable(this.index, true);
    }

    /**
     * Is this a closed term?
     * @param {number} x - The size of the context.
     * @return {boolean} Is the term closed?
     */
    isClosed(x){
        return (x > this.index);
    }

    /**
     * How many subterms does this term have?
     * @return {number} The number of subterms in this term.
     */
    subterms(){
        return 1;
    }

    /**
     * How many crossings does this term have?
     * @return {number} The number of crossings in this term.
     */
    crossings(){
        return 0;
    }

    /**
     * How many abstractions does this term have?
     * @return {number} The number of abstractions in this term.
     */
    abstractions(){
        return 0;
    }

    /**
     * How many applications does this term have?
     * @return {number} The number of applications in this term.
     */
    applications(){
        return 0;
    }

    /**
     * How many variables does this term have?
     * @return {number} The number of variables in this term.
     */
    variables(){
        return 1;
    }

    /**
     * Helper function for uniqueVariables()
     * @param {number[]} seen The variables that have already been seen.
     * @return {number[]} [The number of unique variables, the seen variables].  
     */
    uniqueVariablesHelper(seen){

        if(seen.includes(this.index)){
            return [0, seen];
        } 

        return [1, seen.concat(this.index)];

    }

    /**
     * How many unique variables does this term have?
     * @return {number} The number of unique variables in this term.
     */
    uniqueVariables(){
        return this.uniqueVariablesHelper([])[0];
    }

    /**
     * How many free variables does this term have?
     * @return {number} The number of free variables in this term.
     */
    freeVariables(){
        return 1;
    }

    /**
     * What are the indices of the free variables in this term in the order they are used?
     * @return {number[]} The array of free variables used in this term.
     */
    freeVariableIndices(){
        return [this.index];
    }

    /**
     * How many times is a variable used?
     * @param {number} index The variable to check for
     * @return {number} The number of times a variable is used. 
     */
    numberOfUses(index){
        if(index === this.index){
            return 1;
        }

        return 0;
    }

    /**
     * Is this term a beta redex?
     * @return {boolean} Whether this term is a beta redex.
     */
    isBetaRedex(){
        return false;
    }

    /**
     * Does this term contain a beta redex?
     * @return {boolean} Whether this term contains a beta redex.
     */
    hasBetaRedex(){
        return false;
    }

    /**
     * Does this term contain a beta redex (not including itself)?
     * @return {boolean} Whether this term contains a beta redex (not including itself).
     */
    hasBetaRedexInside(){
        return false;
    }

    /**
     * How many beta redexes does this term contain?
     * @return {number} How many beta redexes this term contains.
     */
    betaRedexes(){
        return 0;
    }

    /**
     * Print all of the redexes in this term.
     * @param {Object} ctx - The context of this lambda term.
     * @return {String[]} The array of all redexes in this term.
     */
    printRedexes(ctx){
        return [];
    }

    /**
     * Get an HTML representation of this term.
     * @param {boolean} deBruijn - If to use de Bruijn indices or not.
     * @param {Object} ctx - The context of this lambda term.
     * @param {number} x - The layer this term is at - determines whether brackets are required.
     * @param {number} vars - The number of variables encountered so far.
     * @param {number} abs - The number of abstractions encountered so far.
     * @param {number} apps - The number of applications encountered so far.
     * @param {number} betas - The number of beta redexes encountered so far.
     * @return {string} The HTML string.
     */
    printHTML(deBruijn, ctx, x, vars, abs, apps, betas){

        if(x === undefined){
            x = 0;
            vars = 0;
            abs = 0;
            apps = 0;
            betas = 0;
        }

        var string = '<span class = "var-' + vars + '">';

        if(deBruijn){
            string += this.index;
        } else {

            var label = ctx.getCorrespondingVariable(this.index, true);

            if(this.alias !== ""){
                label = this.alias;
            }

            string += label;
        }
        
        string += '</span>';
        vars++;

        return [string, vars, abs, apps, betas];

    }

    /**
     * Generate 'pretty' variable names (e.g. x,y,z...) for this term.
     * @param {Object} ctx - The context for this lambda term.
     * @param {boolean} x - Flag to indicate if this is a subcall.
     */
    generatePrettyVariableNames(ctx, x){
        return;
    }

}

/** Class representing a lambda abstraction. */
class LambdaAbstraction{

    /**
     * Create a lambda abstraction.
     * @param {Object}      t       - The scope of this lambda abstraction.
     * @param {string}      label   - The label this lambda abstraction has.
     */
    constructor(t, label, alias, id){
        if(alias === undefined){
            alias = "";
        }

        this.t = t; 
        this.label = label; 
        this.closed = []
        this.alias = alias;
        this.id = id;
        this.print = this.prettyPrint();
    }

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

        var string = "";

        if(x === 0){
            string = "\u03BB " + this.t.prettyPrint(0);
        } else {
            string = "(\u03BB " + this.t.prettyPrint(0) + ")";
        }

        return string;
    }

    /**
     * Get a pretty print of this term using the actual labels.
     * @param {Object} ctx  - The context of this lambda term.
     * @param {number} x    - The layer this term is at - determines whether brackets are required.
     * @return {string} The pretty string.
     */
    prettyPrintLabels(ctx, x){

        if(this.alias !== ""){
            return this.alias;
        }

        if(x === undefined){
            x = 0;
        }

        ctx.pushTerm(this.label);
        var string = "\u03BB" + this.label + ". " + this.t.prettyPrintLabels(ctx, 0);
        
        if(x !== 0){
            string = "(" + string + ")";
        }

        ctx.popTerm();
        return string;
    }

    /**
     * Is this a closed term?
     * @param {number} x - The size of the context.
     * @return {boolean} Is the term closed?
     */
    isClosed(x){

        if(this.closed[x] === undefined){
            if(x === undefined){
                x = 0;
            }
    
            this.closed[x] = this.t.isClosed(x + 1);
        }

        return this.closed[x];

    }

    /**
     * How many subterms does this term have?
     * @return {number} The number of subterms in this term.
     */
    subterms(){
        return 1 + this.t.subterms();
    }

    /**
     * How many crossings does this term have?
     * @return {number} The number of crossings in this term.
     */
    crossings(){
        return this.t.crossings();
    }

    /**
     * How many abstractions does this term have?
     * @return {number} The number of abstractions in this term.
     */
    abstractions(){
        return 1 + this.t.abstractions();
    }

    /**
     * How many applications does this term have?
     * @return {number} The number of applications in this term.
     */
    applications(){
        return this.t.applications();
    }

    /**
     * How many variables does this term have?
     * @return {number} The number of variables in this term.
     */
    variables(){
        return this.t.variables();
    }

    /**
     * Helper function for uniqueVariables()
     * @param {number[]} seen The variables that have already been seen.
     * @return {number[]} [The number of unique variables, the seen variables].  
     */
    uniqueVariablesHelper(seen){

        var newSeen = seen.map(x => x + 1);

        var t = this.t.uniqueVariablesHelper(newSeen);

        return [t[0], t[1].map(x => x - 1)];

    }

    /**
     * How many unique variables does this term have?
     * @return {number} The number of unique variables in this term.
     */
    uniqueVariables(){
        return this.uniqueVariablesHelper([])[0];
    }

    /**
     * How many free variables does this term have?
     * @return {number} The number of free variables in this term.
     */
    freeVariables(){

        if(this.t.freeVariables() === 0){
            return 0;
        }

        return this.t.freeVariables() - this.t.numberOfUses(0);
    }

    /**
     * What are the indices of the free variables in this term in the order they are used?
     * @return {number[]} The array of free variables used in this term.
     */
    freeVariableIndices(){
        return this.t.freeVariableIndices().filter(x => x !== 0).map(x => x - 1);
    }
    
    /**
     * How many times is a variable used?
     * @param {number} index The variable to check for
     * @return {number} The number of times a variable is used. 
     */
    numberOfUses(index){
        return this.t.numberOfUses(index+1);
    }

    /**
     * Is this term a beta redex?
     * @return {boolean} Whether this term is a beta redex.
     */
    isBetaRedex(){
        return false;
    }

    /**
     * Does this term contain a beta redex?
     * @return {boolean} Whether this term contains a beta redex.
     */
    hasBetaRedex(){
        return this.t.hasBetaRedex();
    }

    /**
     * Does this term contain a beta redex (not including itself)?
     * @return {boolean} Whether this term contains a beta redex (not including itself).
     */
    hasBetaRedexInside(){
        return this.t.hasBetaRedex();
    }

    /**
     * How many beta redexes does this term contain?
     * @return {number} How many beta redexes this term contains.
     */
    betaRedexes(){
        return this.t.betaRedexes();
    }

    /**
     * Print all of the redexes in this term.
     * @param {Object} ctx - The context of this lambda term.
     * @return {String[]} The array of all redexes in this term.
     */
    printRedexes(ctx){

        ctx.pushTerm(this.label);
        var redexes = this.t.printRedexes(ctx);
        ctx.popTerm();
        return redexes;
    }

    /**
     * Get an HTML representation of this term.
     * @param {boolean} deBruijn - If to use de Bruijn indices or not.
     * @param {Object} ctx - The context of this lambda term.
     * @param {number} x - The layer this term is at - determines whether brackets are required.
     * @param {number} vars - The number of variables encountered so far.
     * @param {number} abs - The number of abstractions encountered so far.
     * @param {number} apps - The number of applications encountered so far.
     * @param {number} betas - The number of beta redexes encountered so far.
     * @return {string} The HTML string.
     */
    printHTML(deBruijn, ctx, x, vars, abs, apps, betas){

        if(x === undefined){
            x = 0;
            vars = 0;
            abs = 0;
            apps = 0;
            betas = 0;
        }

        var string = '<span class = "abs-' + abs + '">';
        abs++;

        ctx.pushTerm(this.label);
        var scope = this.t.printHTML(deBruijn, ctx, 0, vars, abs, apps, betas);
        ctx.popTerm();

        if(this.alias === "" || deBruijn){
            
            if(x !== 0){
                string += '(';
            }
            
            string += '&lambda;'
            
            if(!deBruijn){
                string += this.label + '. ';
            } else {
                string += " ";
            }
             
            string += scope[0];

            if(x !== 0){
                string += ')';
            }
            
        } else {
            string += this.alias;
        }

        string += '</span>';

        return [string, scope[1], scope[2], scope[3], scope[4]];

    }

    /**
     * Generate 'pretty' variable names (e.g. x,y,z...) for this term.
     * @param {Object} ctx - The context for this lambda term.
     * @param {boolean} x - Flag to indicate if this is a subcall.
     */
    generatePrettyVariableNames(ctx, x){

        if(this.alias === ""){

            if(x === undefined){
                resetVariableIndices();
                ctx.generatePrettyVariableNames();
            }

            this.label = getNextVariableName();
            ctx.pushTerm(this.label);
            this.t.generatePrettyVariableNames(ctx, true);
            ctx.popTerm(this.label);
        }
    }

}

/** Class representing a lambda application. */
class LambdaApplication{

    /**
     * Create a lambda application.
     * @param {Object} t1 - the first term in the lambda application (the function).
     * @param {Object} t2 - the second term in the lambda application (the argument).
     */
    constructor(t1, t2, alias, id){
        if(alias === undefined){
            alias = "";
        }

        this.t1 = t1; 
        this.t2 = t2;
        this.closed = [];
        this.alias = alias;
        this.id = id;
        this.print = this.prettyPrint();
    }

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

        var string = "";

        if(x === 0){
            if(this.t1.getType() === ABS){
                string = this.t1.prettyPrint(1) + " " + this.t2.prettyPrint(1);
            } else {
                string = this.t1.prettyPrint(0) + " " + this.t2.prettyPrint(1);
            }
        } else {
            string = "(" + this.t1.prettyPrint(x) + " " + this.t2.prettyPrint(x+1) + ")";
        }

        return string;
    }

    /**
     * Get a pretty print of this term using the actual labels.
     * @param {Object} ctx  - The context of this lambda term.
     * @param {number} x    - The layer this term is at - determines whether brackets are required.
     * @return {string} The pretty string.
     */
    prettyPrintLabels(ctx, x){

        if(this.alias !== ""){
            return this.alias;
        }

        if(x === undefined){
            x = 0;
        }

        var string = "";

        if(x === 0){
            if(this.t1.getType() === ABS && this.t1.alias === ""){
                string = "(" + this.t1.prettyPrintLabels(ctx, 0) + ") " + this.t2.prettyPrintLabels(ctx, 1);
            } else {
                string = this.t1.prettyPrintLabels(ctx, 0) + " " + this.t2.prettyPrintLabels(ctx, 1);
            } 
        } else {
            string = "(" + this.t1.prettyPrintLabels(ctx, x) + " " + this.t2.prettyPrintLabels(ctx, x+1) + ")";
        }

        return string;
    }

    /**
     * Is this a closed term?
     * @param {number} x - The size of the context.
     * @return {boolean} Is the term closed?
     */
    isClosed(x){

        if(this.closed[x] === undefined){
            if(x === undefined){
                x = 0;
            }

            this.closed[x] = this.t1.isClosed(x) && this.t2.isClosed(x);
        }

        return this.closed[x];

    }

    /**
     * How many subterms does this term have?
     * @return {number} The number of subterms in this term.
     */
    subterms(){
        return 1 + this.t1.subterms() + this.t2.subterms();
    }

    /**
     * How many crossings does this term have?
     * @return {number} The number of crossings in this term.
     */
    crossings(){
        var freeVarsLHS = this.t1.freeVariableIndices();
        var freeVarsRHS = this.t2.freeVariableIndices();

        var crossings = this.t1.crossings() + this.t2.crossings();
        var m = freeVarsLHS.length;
        var n = freeVarsRHS.length;

        for(var i = 0; i < m; i++){
            for(var j = 0; j < n; j++){
                if(freeVarsLHS[i] < freeVarsRHS[j]){
                    crossings++;
                }
            }
        }

        return crossings;
    }

    /**
     * How many abstractions does this term have?
     * @return {number} The number of abstractions in this term.
     */
    abstractions(){
        return this.t1.abstractions() + this.t2.abstractions();
    }

    /**
     * How many applications does this term have?
     * @return {number} The number of applications in this term.
     */
    applications(){
        return 1 + this.t1.applications() + this.t2.applications();
    }

    /**
     * How many variables does this term have?
     * @return {number} The number of variables in this term.
     */
    variables(){
        return this.t1.variables() + this.t2.variables();
    }

    /**
     * Helper function for uniqueVariables()
     * @param {number[]} seen The variables that have already been seen.
     * @return {number[]} [The number of unique variables, the seen variables].  
     */
    uniqueVariablesHelper(seen){

        var lhs = this.t1.uniqueVariablesHelper(seen);
        var rhs = this.t2.uniqueVariablesHelper(lhs[1]);

        return [lhs[0] + rhs[0], rhs[1]];

    }

    /**
     * How many unique variables does this term have?
     * @return {number} The number of unique variables in this term.
     */
    uniqueVariables(){
        return this.uniqueVariablesHelper([])[0];
    }

    /**
     * How many free variables does this term have?
     * @return {number} The number of free variables in this term.
     */
    freeVariables(){
        return this.t1.freeVariables() + this.t2.freeVariables();
    }

    /**
     * How many times is a variable used?
     * @param {number} index The variable to check for
     * @return {number} The number of times a variable is used. 
     */
    numberOfUses(index){
        return this.t1.numberOfUses(index) + this.t2.numberOfUses(index);
    }

    /**
     * What are the indices of the free variables in this term in the order they are used?
     * @return {number[]} The array of free variables used in this term.
     */
    freeVariableIndices(){
        return this.t1.freeVariableIndices().concat(this.t2.freeVariableIndices());
    }

    /**
     * Is this term a beta redex?
     * @return {boolean} Whether this term is a beta redex.
     */
    isBetaRedex(){
        if(this.t1.getType() === ABS){
            return true;
        }
        
        return false;
    }

    /**
     * Does this term contain a beta redex?
     * @return {boolean} Whether this term contains a beta redex.
     */
    hasBetaRedex(){
        return (this.isBetaRedex() || (this.t1.hasBetaRedex() || this.t2.hasBetaRedex()));
    }

    /**
     * Does this term contain a beta redex (not including itself)?
     * @return {boolean} Whether this term contains a beta redex (not including itself).
     */
    hasBetaRedexInside(){
        return (this.t1.hasBetaRedex() || this.t2.hasBetaRedex());
    }

    /**
     * How many beta redexes does this term contain?
     * @return {number} How many beta redexes this term contains.
     */
    betaRedexes(){

        var redexes = 0;

        if(this.isBetaRedex()){
            redexes++;
        }

        return redexes + this.t1.betaRedexes() + this.t2.betaRedexes();
    }

    /**
     * Print all of the redexes in this term.
     * @param {Object} ctx - The context of this lambda term.
     * @return {String[]} The array of all redexes in this term.
     */
    printRedexes(ctx){

        var array = [];
        
        if(this.isBetaRedex()){
            array[0] = this.prettyPrintLabels(ctx);
        }

        return array.concat(this.t1.printRedexes(ctx).concat(this.t2.printRedexes(ctx)));
    }

    /**
     * Get an HTML representation of this term.
     * @param {boolean} deBruijn - Whether to use de Bruijn indices.
     * @param {Object} ctx - The context of this lambda term.
     * @param {number} x - The layer this term is at - determines whether brackets are required.
     * @param {number} vars - The number of variables encountered so far.
     * @param {number} abs - The number of abstractions encountered so far.
     * @param {number} apps - The number of applications encountered so far.
     * @param {number} betas - The number of beta redexes encountered so far.
     * @return {string} The HTML string.
     */
    printHTML(deBruijn, ctx, x, vars, abs, apps, betas){

        if(x === undefined){
            x = 0;
            vars = 0;
            abs = 0;
            apps = 0;
            betas = 0;
        }

        
        var string = '<span ';
        
        if(this.isBetaRedex()){
            string += 'id = "beta-' + betas + '" '
        }

        string += 'class = "app-' + apps;
        apps++;

        if(this.isBetaRedex()){
            string += ' beta-' + betas;
            betas++;
        }

        string += '">';

        var y;
        var z;

        if(x === 0){
            if(this.t1.getType() === ABS){
                y = 1;
                z = 1;
            } else {
                y = 0;
                z = 1;
            }
        } else {
            y = x;
            z = x + 1;
        }

        var lhs = this.t1.printHTML(deBruijn, ctx, y, vars, abs, apps, betas);
        var rhs = this.t2.printHTML(deBruijn, ctx, z, lhs[1], lhs[2], lhs[3], lhs[4]);

        if(this.alias === "" || deBruijn){
            
            if(x !== 0){
                string += "(";
            }
                
            string += lhs[0] + " " + rhs[0];
            
            if(x !== 0){
                string += ")";
            }

        } else {
            string += this.alias;
        }

        string += "</span>";

        return [string, rhs[1], rhs[2], rhs[3], rhs[4]];

    }

    /**
     * Generate 'pretty' variable names (e.g. x,y,z...) for this term.
     * @param {Object} ctx - The context for this lambda term.
     * @param {boolean} x - Flag to indicate whether this is a subcall.
     */
    generatePrettyVariableNames(ctx, x){
        
        if(this.alias === ""){

            if(x === undefined){
                resetVariableIndices();
                ctx.generatePrettyVariableNames();
            }

            this.t1.generatePrettyVariableNames(ctx, true);
            this.t2.generatePrettyVariableNames(ctx, true);
        }
    }

}

function getFunction(functionName){
    for(var i = 0; i < functions.length; i++){
        if(functions[i][0] === functionName){
            return functions[i][1];
        }
    }
}

/** Class representing an environment of currently abstracted variables. */
class LambdaEnvironment{

    /**
     * Create a new empty environment.
     */
    constructor(){this.env = [], this.labels = []};

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
     * @param {string} label - (optional) The label of the variable to push into the environment. 
     */
    pushTerm(variable, label){

        if(label === undefined){
            label = variable;
        }

        if(this.env[0] === ""){
            this.env[0] = variable;
            this.labels[0] = label;
        } else {
            this.env.push(variable);
            this.labels.push(label);
        }

    }

    /**
     * Remove a term from the environment.
     */
    popTerm(){
        this.env.pop();
        this.labels.pop();
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
     * @param {number} index - The index to determine the variable name from.
     * @param {boolean} label - Whether to return the actual label of this variable.
     * @return {string} The name of the variable (? if could not be found)
     */
    getCorrespondingVariable(index, label){

        if(index < 0 || this.env.length - 1 - index < 0){
            return "?";
        }

        if(label === undefined){
            return this.env[this.env.length - 1 - index];
        }

        return this.labels[this.labels.length - 1 - index];
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

    /**
     * Get the corresponding lambda node for this variable index
     * @return {string} The name of the node (? if could not be found)
     */
    getNode(index){

        if(index < 0 || this.nodeNames.length - 1 - index < 0){
            return "?";
        }

        return this.nodeNames[this.nodeNames.length - 1 - index];
    }

    /**
     * Generate 'pretty' names for the free variables in this context (e.g. a, b, c...).
     */
    generatePrettyVariableNames(){

        for(var i = 0; i < this.env.length; i++){

            this.env[i] = getNextFreeVariableName();
            this.labels[i] = this.env[i];

        }
    }
}

/**
 * Check if a node is not in the frontier or the seen.
 * @param {Object} term - The term to check for in the frontier or the seen.
 * @param {Object[]} frontier - The frontier to check in.
 * @param {Object[]} seen - The seen to check in.
 * @return {boolean} If the term is not in the frontier or the seen.
 */
function nextNodeNotInFrontierOrSeen(term, frontier, seen){

    for(var k = 0; k < frontier.length; k++){
        if(frontier[k][0].prettyPrint() === term.prettyPrint()){
            return false;
        }
    }

    for(var k = 0; k < seen.length; k++){
        if(seen[k].prettyPrint() === term.prettyPrint()){
            return false;
        }
    }

    return true;
}

/**
 * A reduction graph showing all the reductions that lead to a normal form (if one exists!).
 */
class ReductionGraph{

    /**
     * Create a new reduction graph.
     * 
     * Structure of the adjacency matrix:
     * [[term, [[reduction1, redex1], [reduction2, redex2], ...], level], ... [normal form, [ ], level]]
     * 
     * @param {Object} term - The lambda term to create the reduction graph for.
     */
    constructor(term){
        this.terms = [term];
        this.matrix = [];
        this.highestLevel = 0;

        var seen = [];
        var frontier = [[term, 0]];
        var i = 0;

        var failed = false;

        while(frontier.length !== 0){

            if(i > maximumPathLength){
                break;
            }

            /* Examine the next term in the frontier containing all next reductions. */
            var nextTerm = frontier.shift();
            var workingTerm = nextTerm[0];
            var level = nextTerm[1];

            if(level > this.highestLevel){
                this.highestLevel = level;
            }

            /* Add the new reduction to the matrix. */
            smartPush(this.matrix, [workingTerm, [], level]);

            /* Indicate that we've seen this term so it won't be added again. */
            smartPush(seen, workingTerm);   

            /* Get all the reductions from this new term. */
            var reductions = getAllOneStepReductions(workingTerm);

            for(var j = 0; j < reductions.length; j++){

                /* Add the reduction to the row in the matrix. */
                smartPush(this.matrix[i][1], reductions[j]);

                /* If the reductions have not been seen before, add them to the frontier to be examined later. */
                if(nextNodeNotInFrontierOrSeen(reductions[j][0], frontier, seen)){
                    smartPush(frontier, [reductions[j][0], level + 1]);
                }
            }

            i++;
        }

        this.graphStats = [0,0,0,0,0,0,0,0,0,0,0]
    }

    /**
     * Get the corresponding index of the entry in the matrix for a term.
     * @param {Object} term - The lambda term to look for.
     * @return {number} The index of the entry in the matrix for this term. 
     */
    getTermEntry(term){

        for(var i = 0; i < this.matrix.length; i++){
            if(term.prettyPrint() === this.matrix[i][0].prettyPrint()){
                return i;
            }
        }

        return -1;
    }

    /**
     * Print a textual representation of the graph, showing the adjacency matrix.
     * @return {string} A textual representation of the graph.
     */
    printGraph(){

        var string = "";

        for(var i = 0; i < this.matrix.length; i++){
            string += this.matrix[i][0].prettyPrint();
            
            for(var j = 0; j < this.matrix[i][1].length; j++){
                string += "\n----" + this.matrix[i][1][j][0].prettyPrint() + " via " + this.matrix[i][1][j][1].prettyPrint();
            }

            string += "\n";
        }

        return string;


    }

    /**
     * Find the lengths of all paths from one of the terms in the matrix to the normal form (if it exists!).
     * @param {number} i - The index of the element in the matrix.
     * @return {number} The length of the path from this term to the normal form (if if exists!).
     */
    pathLengthsFromTerm(i, x){

        if(x === undefined){
            loop = false;
            x = 0;
        } else if (x > maximumPathLength){
            loop = true;
            return -1;
        }

        var workingTerm = this.matrix[i];

        /* If term is already in its normal form */
        if(workingTerm[1].length === 0){
            return [[0], 0];
        }

        var pathLengths = [];

        var totalPaths = "unknown"
        
        if(!loop){
            totalPaths = workingTerm[1].length;
        }
        
        var seen = [];

        for(var i = 0; i < workingTerm[1].length; i++){

            var index = this.getTermEntry(workingTerm[1][i][0]);
            var subpaths = this.pathLengthsFromTerm(index, x+1);

            if(subpaths !== -1){

                for (var j = 0; j < subpaths[0].length; j++){
                    smartPush(pathLengths, subpaths[0][j]);
                }
                
                if(!seen.includes(workingTerm[0].prettyPrint())){
                    smartPush(seen, workingTerm[0].prettyPrint());

                    if(!loop){
                        totalPaths += subpaths[1];
                    }
                }
            } else {
                totalPaths = "unknown";
            }

        }

        pathLengths = pathLengths.map(x => parseInt(x) + 1);
        return [pathLengths, totalPaths];

    }

    calculatePathStats(){
        this.graphStats = this.pathsToNormalForm();
    }

    /**
     * Find the length of types of path in this normalisation graph.
     * @return {number} The array of different path lengths: 0: total, 1: min, 2: max, 3: mean, 4: mode, 5: median.
     */
    pathsToNormalForm(){

        /* The first element of the matrix is the start point */
        var allPaths = this.pathLengthsFromTerm(0);
        
        if(allPaths === -1 || allPaths[0].length === 0){
            return ["unknown", "unknown", "unknown", "unknown", "unknown", "unknown"];
        }

        var paths = allPaths[0];

        var result = [];
 
        /* Total */
        result[0] = allPaths[1];

        /* Min */
        result[1] = Math.min(...paths);
       
        /* Max */
        result[2] = Math.max(...paths);
        
        /* Mean */
        result[3] = paths.reduce(function(a, b){return a + b;}) / paths.length;

        /* Mode */

        var counts = [];
        var newPaths = paths.slice(0);

        /* Find the count of every element in the path lengths array. */
        while(newPaths.length > 0){

            var len = newPaths.length;
            var elem = newPaths[0];
            newPaths = newPaths.filter(x => x !== elem);
            var count = len - newPaths.length;
            smartPush(counts, [elem, count]);

        }

        var highest = 0;
        var elems = [];

        /* Establish the highest occuring element(s). */
        for(var i = 0; i < counts.length; i++){
            if(counts[i][1] > highest){
                highest = counts[i][1];
                elems = [counts[i][0]];
            } else if (counts[i][1] === highest){
                smartPush(elems, counts[i][0]);
            }
        }

        result[4] = elems;


        /* Median */

        paths = paths.sort();

        if(paths.length % 2 === 1){
            var x = Math.ceil(paths.length / 2);
            result[5] = paths[x-1];
        } else {
            var x = paths.length / 2;
            var m1 = paths[x-1];
            var m2 = paths[x];
            result[5] = (m1 + m2) / 2;
        }

        return result;
    

    }

    /**
     * Get the total number of paths to the normal form (if one exists!).
     * @return {number} The total number of paths to the normal form.
     */
    totalPathsToNormalForm(){
        return this.graphStats[0];
    }

    /**
     * Get the shortest path to the normal form (if one exists!).
     * @return {number} The shortest path to the normal form.
     */
    shortestPathToNormalForm(){
        return this.graphStats[1];
    }

    /**
     * Get the longest path to the normal form (if one exists!).
     * @return {number} The longest path to the normal form.
     */
    longestPathToNormalForm(){
        return this.graphStats[2];
    }

    /**
     * Get the mean length of path to the normal form (if one exists!).
     * @return {number} The mean path to the normal form.
     */
    meanPathToNormalForm(){
        return this.graphStats[3];
    }

    /**
     * Get the most common lengths of path to the normal form (if one exists!).
     * @return {number[]} The most common paths to the normal form.
     */
    modePathToNormalForm(){
        return this.graphStats[4];
    }

    /**
     * Get the median length of path to the normal form (if one exists!).
     * @return {number} The median path to the normal form.
     */
    medianPathToNormalForm(){
        return this.graphStats[5];
    }

    /**
     * Get the number of vertices in this graph (i.e. unique reductions).
     * @return {number} The number of vertices in this graph.
     */
    vertices(){
        return this.matrix.length;
    }

    /**
     * Get the number of edges in this graph (i.e. unique redexes).
     * @return {number} The number of edges in this graph.
     */
    edges(){

        var edges = 0;

        for(var i = 0; i < this.matrix.length; i++){
            edges += this.matrix[i][1].length;
        }

        return edges;
    }

}