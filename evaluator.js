/**
 * Shifts all the de Bruijn indices in a t by a certain amount.
 * @param {Object}      t    - The lambda term to do the shifting to.
 * @param {number}      d    - The number of places to shift by.
 * @param {number}      c    - The cutoff point, below which numbers will not be shifted by.
 * @return {Object} The newly shifted lambda term.
 */ 
function shift (t, d, c){

    console.log("Shifting " + t.prettyPrint() + " by " + d + " cutoff " + c);

    switch(t.getType()){
        case VAR:
            if(t.index < c){
                return t;
            } 
                
            return new LambdaVariable(t.index + d);

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
            return new LambdaAbstraction(substitute(shift(s, 1, 0), j + 1, t.t));

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
function applicationAbstraction(abs, val){
    return shift(substitute(shift(val, 1, 0), 0, abs), -1, 0);
}

/**
 * Evaluate a lambda expression.
 * @param {Object} t - The lambda expression to evaluate.
 * @return The fully evaluated lambda expression.
 */
function evaluate(t){
    ordinal();
    console.log("Evaluating " + t.prettyPrint());

    if(t.getType() === APP){

            var t1 = t.t1;
            var t2 = t.t2;

            if(t1.getType() === ABS && t2.getType() === ABS){
                return applicationAbstraction(t2, t1.t);
            }

            if(t1.getType() === ABS){
                return new LambdaApplication(t1, evaluate(t2));
            }

            return new LambdaApplication(evaluate(t1), t2);

    }

    console.log("Returning " + t.prettyPrint());
    return t;

}