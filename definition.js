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
const cutoff = 20;

/** Constants to represent different modes */
const MAX = 0;
const MIN = 1;
const AVERAGE = 2;

var currentVariableIndex = 0;
const variableNames = ['x', 'y', 'z', 'w', 'u', 'v']

var currentFreeVariableIndex = 0;
const freeVariableNames = ['a', 'b', 'c', 'd', 'e'];

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
     * @param {string} label - The label this term is associated with.
     */
    constructor(index, label, name){

        if(name === undefined){
            name = "";
        }

        this.index = index;
        this.name = name;

        if(label !== ""){
            this.label = label
        } else {
            this.label = index.toString();
        }

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

        if(this.name !== ""){
            return this.name;
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
     * @param {Object} ctx - The context of this lambda term.
     * @param {number} x - The layer this term is at - determines whether brackets are required.
     * @param {number} vars - The number of variables encountered so far.
     * @param {number} abs - The number of abstractions encountered so far.
     * @param {number} apps - The number of applications encountered so far.
     * @param {number} betas - The number of beta redexes encountered so far.
     * @return {string} The HTML string.
     */
    printHTML(ctx, x, vars, abs, apps, betas){

        if(x === undefined){
            x = 0;
            vars = 0;
            abs = 0;
            apps = 0;
            betas = 0;
        }

        var label = ctx.getCorrespondingVariable(this.index, true);

        if(this.name !== ""){
            label = this.name;
        }

        var string = '<span class = "var-' + vars + '">' + label + '</span>';
        vars++;

        return [string, vars, abs, apps, betas];

    }

    /**
     * Generate 'pretty' variable names (e.g. x,y,z...) for this term.
     * @param {Object} ctx - The context for this lambda term.
     * @param {boolean} x - Flag to indicate if this is a subcall.
     */
    generatePrettyVariableNames(ctx, x){

        if(x === undefined){
            resetVariableIndices();
            ctx.generatePrettyVariableNames();
        }

        this.label = ctx.getCorrespondingVariable(this.index, true);

    }

}

/** Class representing a lambda abstraction. */
class LambdaAbstraction{

    /**
     * Create a lambda abstraction.
     * @param {Object}      t       - The scope of this lambda abstraction.
     * @param {string}      label   - The label this lambda abstraction has.
     */
    constructor(t, label, name){
        if(name === undefined){
            name = "";
        }

        this.t = t; 
        this.label = label; 
        this.closed = []
        this.name = name;
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

        if(this.name !== ""){
            return this.name;
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
     * How many free variables does this term have?
     * @return {number} The number of free variables in this term.
     */
    freeVariables(){

        if(this.t.freeVariables() === 0){
            return 0;
        }

        return this.t.freeVariables() - 1;
    }

    /**
     * What are the indices of the free variables in this term in the order they are used?
     * @return {number[]} The array of free variables used in this term.
     */
    freeVariableIndices(){
        return this.t.freeVariableIndices().filter(x => x !== 0).map(x => x - 1);
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
     * @param {Object} ctx - The context of this lambda term.
     * @param {number} x - The layer this term is at - determines whether brackets are required.
     * @param {number} vars - The number of variables encountered so far.
     * @param {number} abs - The number of abstractions encountered so far.
     * @param {number} apps - The number of applications encountered so far.
     * @param {number} betas - The number of beta redexes encountered so far.
     * @return {string} The HTML string.
     */
    printHTML(ctx, x, vars, abs, apps, betas){

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
        var scope = this.t.printHTML(ctx, 0, vars, abs, apps, betas);
        ctx.popTerm();

        if(this.name !== ""){
            string += this.name;
        } else {
            if(x !== 0){
                string += '(';
            }

            string += '&lambda;' + this.label + '. ' + scope[0];

            if(x !== 0){
                string += ')';
            }
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

/** Class representing a lambda application. */
class LambdaApplication{

    /**
     * Create a lambda application.
     * @param {Object} t1 - the first term in the lambda application (the function).
     * @param {Object} t2 - the second term in the lambda application (the argument).
     */
    constructor(t1, t2, name){
        if(name === undefined){
            name = "";
        }

        this.t1 = t1; this.t2 = t2, this.closed = [], this.name = name, this.print = this.prettyPrint();
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

        if(this.name !== ""){
            return this.name;
        }

        if(x === undefined){
            x = 0;
        }

        var string = "";

        if(x === 0){
            if(this.t1.getType() === ABS && this.t1.name === ""){
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
     * How many free variables does this term have?
     * @return {number} The number of free variables in this term.
     */
    freeVariables(){
        return this.t1.freeVariables() + this.t2.freeVariables();
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
     * @param {Object} ctx - The context of this lambda term.
     * @param {number} x - The layer this term is at - determines whether brackets are required.
     * @param {number} vars - The number of variables encountered so far.
     * @param {number} abs - The number of abstractions encountered so far.
     * @param {number} apps - The number of applications encountered so far.
     * @param {number} betas - The number of beta redexes encountered so far.
     * @return {string} The HTML string.
     */
    printHTML(ctx, x, vars, abs, apps, betas){

        if(x === undefined){
            x = 0;
            vars = 0;
            abs = 0;
            apps = 0;
            betas = 0;
        }

        var string = '<span class = "app-' + apps;
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

        var lhs = this.t1.printHTML(ctx, y, vars, abs, apps, betas);
        var rhs = this.t2.printHTML(ctx, z, lhs[1], lhs[2], lhs[3], lhs[4]);

        if(this.name !== ""){
            string += this.name;
        } else {

            if(x !== 0){
                string += "(";
            }
                
            string += lhs[0] + " " + rhs[0];
            
            if(x !== 0){
                string += ")";
            }
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
        
        if(x === undefined){
            resetVariableIndices();
            ctx.generatePrettyVariableNames();
        }

        this.t1.generatePrettyVariableNames(ctx, true);
        this.t2.generatePrettyVariableNames(ctx, true);

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
        if(frontier[k].prettyPrint() === term.prettyPrint()){
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
     * @param {Object} term - The lambda term to create the reduction graph for.
     */
    constructor(term){
        this.terms = [term];
        this.matrix = [];

        var seen = [];
        var frontier = [term];
        var i = 0;

        while(frontier.length !== 0){

            var workingTerm = frontier.shift();

            smartPush(this.matrix, [workingTerm, []]);
            smartPush(seen, workingTerm);   

            var reductions = getAllOneStepReductions(workingTerm);

            for(var j = 0; j < reductions.length; j++){

                smartPush(this.matrix[i][1], reductions[j]);

                if(nextNodeNotInFrontierOrSeen(reductions[j][0], frontier, seen)){
                    smartPush(frontier, reductions[j][0]);
                }
            }

            i++;
        }

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
    
    shortestPathToNormalForm(){
        return 0;
    }

    longestPathToNormalForm(){
        return 0;
    }

    averagePathToNormalForm(){
        return 0;
    }

    vertices(){
        return 0;
    }

    edges(){
        return 0;
    }

}