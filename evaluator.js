/**
 * Functions for evaluating and normalising lambda terms.
 * 
 * @author George Kaye
 */

/** Maximum number of operations to perform during normalisation or evaluation */
const max_execution_ops = 100;
/** Current number of operations performed during normalisation */
var current_execution_ops = 0;

/**
 * Shifts all the de Bruijn indices in a t by a certain amount.
 * @param {Object}      t    - The lambda term to do the shifting to.
 * @param {number}      d    - The number of places to shift by.
 * @param {number}      c    - The cutoff point, below which numbers will not be shifted by.
 * @return {Object} The newly shifted lambda term.
 */ 
function shift (t, d, c){

    if(c === undefined){
        c = "none"
    }

    switch(t.getType()){
        case VAR:
            if(c !== "none" && t.index < c){
                return t;
            } 
                
            return new LambdaVariable(t.index + d, t.label);

        case ABS:
            return new LambdaAbstraction(shift(t.t, d, c+1), t.label);

        case APP:
            return new LambdaApplication(shift(t.t1, d, c), shift(t.t2, d, c));
    }
}

/**
 * Substitute a term for a variable in a term - i.e. [j -> s] t.
 * @param {Object} s - The term to substitute in.
 * @param {number} j - The index of the variable to substitute.
 * @param {Object} t - The term the substitution is to be performed in.
 * @return {Object} The newly substituted lambda term.
 */
function substitute(s, j, t){

    console.log("Substituting " + s.prettyPrint() + " for " + j + " in " + t.prettyPrint());

    switch(t.getType()){
        case VAR:
            if(t.index === j){
                return s;
            }

            return t;

        case ABS:
            return new LambdaAbstraction(substitute(shift(s, 1, 0), j + 1, t.t), t.label);

        case APP:
            return new LambdaApplication(substitute(s, j, t.t1), substitute(s, j, t.t2));
    }

}

/**
 * Perform a beta-reduction.
 * @param {Object} abs - The abstraction to substitute the value in.
 * @param {Object} val - The value to substitute into the abstraction.
 * @return {Object} The beta-reduced expression.
 */
function performBetaReduction(abs, val){
    var term = shift(substitute(shift(val, 1, 0), 0, abs.t), -1, 0);

    console.log("Beta reduced term: " + term.prettyPrint());

    return term
}

/**
 * Check if the max execution ops have been reached
 */
function timeout(){
    return current_execution_ops > max_execution_ops;
}

/**
 * Evaluate a lambda expression.
 * @param {Object} t - The lambda expression to evaluate.
 * @param {boolean} x - If this is the first step of evaluation.
 * @return The fully evaluated lambda expression.
 */
function evaluate(t, x){

    if(x === undefined){
        x = true; 
    }
    
    if(x){
        current_execution_ops = 0;
    }

    current_execution_ops++;

    if(timeout()){
        return "Timeout";
    }

    console.log("Evaluating " + t.prettyPrint());

    while(t.getType() === APP){

        var t1 = t.t1;
        var t2 = t.t2;

        if(t1.getType() === ABS && t2.getType() === ABS){
            t = performBetaReduction(t1, t2);
        } else if(t1.getType() === ABS){

            t2 = evaluate(t2)

            if(t2 === "Timeout"){
                return "Timeout";
            }

            t = new LambdaApplication(t1, t2);

        } else {

            t1 = evaluate(t1);

            if(t1 === "Timeout"){
                return "Timeout";
            }

            t = new LambdaApplication(t1, t2);
        }
    }

    console.log("Returning " + t.prettyPrint());
    return t;
}

/**
 * Attempt to normalise a lambda expression (This might not terminate!).
 * @param {Object} t  - The lambda expression to normalise.
 * @param {boolean} x - Whether this is the beginning of normalisation.
 * @return The normalised lambda expression (if the program terminates).
 */
function normalise(t, x){

    if(x === undefined){
        x = true; 
    }
    
    if(x){
        current_execution_ops = 1;
    } else {
        current_execution_ops++;
    }

    if(timeout()){
        return "Timeout";
    }

    console.log("Normalising term: " + t.prettyPrint());

    switch(t.getType()){
        case VAR:
            return t;
        case ABS:

            var normalised_subterm = normalise(t.t, false);

            if(normalised_subterm === "Timeout"){
                return "Timeout";
            }

            var new_abstraction = new LambdaAbstraction(normalised_subterm, t.label);
            return new_abstraction;
        case APP:

            var t1;
            var t2;

            /* Perform a beta-reduction */
            if(t.t1.getType() === ABS){
                t1 = performBetaReduction(t.t1, t.t2);
                console.log("Beta reduction performed: " + t1.prettyPrintLabels());
                return normalise(t1, false);
            }

            t1 = normalise(t.t1, false);
            t2 = normalise(t.t2, false);

            if(t1 === "Timeout" || t2 === "Timeout"){
                return "Timeout";
            }

            var term = new LambdaApplication(t1, t2);

            if(t1.getType() === ABS){
                return normalise(term);
            }

            return term;

    }

}

/**
 * Perform the outermost reduction of a lambda term, if this is possible.
 * @param {Object} term - The lambda term to perform the reduction on.
 * @return {Object} The reduced term (or the original term if no reduction is possible).
 */
function outermostReduction(term){

    if(term.isBetaRedex()){
        return performBetaReduction(term.t1, term.t2);
    }

    if(!term.hasBetaRedex()){
        return term;
    }

    switch(term.getType()){
        case ABS:
            return new LambdaAbstraction(outermostReduction(term.t), term.label);
        case APP:

            if(term.t1.hasBetaRedex()){
                return new LambdaApplication(outermostReduction(term.t1), term.t2);
            }
                
            return new LambdaApplication(term.t1, outermostReduction(term.t2));

    }
}

/**
 * Perform the innermost reduction of a lambda term, if this is possible.
 * @param {Object} term - The lambda term to perform the reduction on.
 * @return {Object} The reduced term (or the original term if no reduction is possible).
 */
function innermostReduction(term){

    if(!term.hasBetaRedex()){
        return term;
    }

    switch(term.getType()){
        case ABS:
                return new LambdaAbstraction(innermostReduction(term.t), term.label);
        case APP:

            if(term.t1.hasBetaRedex()){
                return new LambdaApplication(innermostReduction(term.t1), term.t2);
                
            }

            if(term.t2.hasBetaRedex()){
                return new LambdaApplication(term.t1, innermostReduction(term.t2));
            }
            
            return performBetaReduction(term.t1, term.t2);

    }

}