/**
 * Functions for evaluating and normalising lambda terms.
 * 
 * @author George Kaye
 */

/** Maximum number of operations to perform during normalisation or evaluation */
const maxExecutionOps = 100;
/** Current number of operations performed during normalisation */
var currentExecutionOps = 0;

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

    return term
}

/**
 * Check if the max execution ops have been reached
 */
function timeout(){
    return currentExecutionOps > maxExecutionOps;
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
        currentExecutionOps = 0;
    }

    currentExecutionOps++;

    if(timeout()){
        return "Timeout";
    }

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
        currentExecutionOps = 1;
    } else {
        currentExecutionOps++;
    }

    if(timeout()){
        return "Timeout";
    }

    switch(t.getType()){
        case VAR:
            return t;
        case ABS:

            var normalisedSubterm = normalise(t.t, false);

            if(normalisedSubterm === "Timeout"){
                return "Timeout";
            }

            var newAbstraction = new LambdaAbstraction(normalisedSubterm, t.label);
            return newAbstraction;
        case APP:

            var t1;
            var t2;

            /* Perform a beta-reduction */
            if(t.t1.getType() === ABS){
                t1 = performBetaReduction(t.t1, t.t2);
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

/**
 * Perform a specific reduction, as if they are numbered from left to right, outwards in.
 * @param {Object} term - The lambda term to perform the reduction on.
 * @return {Object[]} The reduced lambda term and a number displaying how many reductions need to be encountered.
 */
function specificReduction(term, i){

    if(!term.hasBetaRedex()){
        return [term, i];
    }

    if(term.isBetaRedex()){

        i--;

        if(i === -1){
            return [performBetaReduction(term.t1, term.t2), i];
        }

    }

    switch(term.getType()){
        case ABS:

            var newScope = specificReduction(term.t, i);

            if(newScope[0] === term.t){
                return [term, newScope[1]];
            }

            return [new LambdaAbstraction(newScope[0], term.label), newScope[1]];
        case APP:
            if(term.t1.hasBetaRedex()){
                var newLHS = specificReduction(term.t1, i);

                if(newLHS[0] === term.t1){
                    var newRHS = specificReduction(term.t2, newLHS[1]);
                    
                    if(newRHS[0] === term.t2){
                        return [term, newRHS[1]];
                    }

                    return [new LambdaApplication(term.t1, newRHS[0]), newRHS[1]];
                }

                return [new LambdaApplication(newLHS[0], term.t2), newLHS[1]];
            }
    }

}

/**
 * Get all reductions accessible by one beta reduction step from a lambda term.
 * @param {Object} term - The lambda term to find the reductions in.
 * @param {boolean} labels - Whether to use the predefined labels or generate new ones.
 * @return {Object[]} All of the reductions accessible from one beta reduction (empty if none).
 */
function getAllOneStepReductions(term, labels){

    var reductions = [];
    var x = 0;

    if(term.isBetaRedex()){
        reductions[0] = [performBetaReduction(term.t1, term.t2), term];
        x++;
    }

    if(term.hasBetaRedex()){
        switch(term.getType()){
            case ABS:
                var scopeReductions = getAllOneStepReductions(term.t, labels);

                for(var i = 0; i < scopeReductions.length; i++){
                    reductions[x] = [new LambdaAbstraction(scopeReductions[i][0], term.label), scopeReductions[i][1]];
                    x++;
                }
                break;
            case APP:
                var lhsReductions = getAllOneStepReductions(term.t1, labels);

                for(var i = 0; i < lhsReductions.length; i++){
                    reductions[x] = [new LambdaApplication(lhsReductions[i][0], term.t2), lhsReductions[i][1]];
                    x++;
                }

                var rhsReductions = getAllOneStepReductions(term.t2, labels);
                
                for(var i = 0; i < rhsReductions.length; i++){
                    reductions[x] = [new LambdaApplication(term.t1, rhsReductions[i][0]), rhsReductions[i][1]];
                    x++;
                }

                break;
        }
    }

    return reductions;

}

function generateReductionTree(term, labels){

    var subtrees = [];

    if(term.hasBetaRedex()){

        var reductions = getAllOneStepReductions(term, labels);

        for(var i = 0; i < reductions.length; i++){
            subtrees[i] = [generateReductionTree(reductions[i][0]), reductions[i][1]];
        }

    }

    return new ReductionTree(term, subtrees);

}