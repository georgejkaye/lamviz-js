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