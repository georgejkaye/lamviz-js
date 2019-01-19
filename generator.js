/**
 * Functions to generate terms from various fragments of the lambda calculus.
 * 
 * @author George Kaye
 */

var varName = 0;

function genVarName(){
    varName += 1;
    return "b" + varName.toString();
}

/**
 * Generate all pure lambda terms with a given number of subterms and free variables.
 * @param {number} n - The number of subterms.
 * @param {number} k - The number of free variables.
 * @return {Object[]} The array of generated terms.
 */
function generateTerms(n, k){

    varName = 0;

    return generateTermsHelper(n, k, 0);

}

/**
 * Generate all pure lambda terms with a given number of subterms and free variables.
 * @param {number} n - The number of subterms.
 * @param {number} k - The number of free variables.
 * @return {Object[]} The array of generated terms.
 */
function generateTermsHelper(n, k, p){

    var terms = [];


    switch(n){
        case 0:
            break;
        case 1:
            for(i = 0; i <= k-1; i++){
                terms[i] = new LambdaVariable(i, "", 0);
            }
            break;
        default:

            var absTerms = generateTermsHelper(n-1, k+1, p);

            for(i = 0; i < absTerms.length; i++){
                absTerms[i] = new LambdaAbstraction(absTerms[i], genVarName());
            }

            var appTerms = [];
            var x = 0;

            for(var m = 1; m <= n-2; m++){
                
                var lhsTerms = generateTermsHelper(m, k, p);
                var rhsTerms = generateTermsHelper(n-1-m, k, p+1);

                for(a = 0; a < lhsTerms.length; a++){
                    for(b = 0; b < rhsTerms.length; b++){
                        //var p = lhsTerms[a].shiftPosition(0);
                        //rhsTerms[b].shiftPosition(1);

                        appTerms[x] = new LambdaApplication(lhsTerms[a], rhsTerms[b]);
                        x++;
                    }
                }
            }

            terms = absTerms.concat(appTerms);
            break;

    }

    return terms;

}

/**
 * Generate all planar lambda terms with a given number of subterms and free variables.
 * @param {number} n - The number of subterms.
 * @param {number} k - The number of free variables.
 * @return {Object[]} The array of generated terms.
 */
function generatePlanarTerms(n, k){
        
    varName = 0;

    var ks = [];

    for(var i = k - 1; i >= 0; i--){
        ks[k-i-1] = i;
    }

    return generatePlanarTermsHelper(n, ks);
}

/**
 * Generate all planar lambda terms with a given number of subterms and free variables.
 * @param {number} n - The number of subterms.
 * @param {number[]} k - The context containing the free variables.
 * @return {Object[]} The array of generated terms.
 */
function generatePlanarTermsHelper(n, k){

    var terms = [];

    switch(n){
        case 0:
            break;
        case 1:
            
            if(k.length === 1){
                terms[0] = new LambdaVariable(k[0], "");
            }

            break;
        default:

            var absTerms = generatePlanarTermsHelper(n-1, k.map(function(e){return e + 1;}).concat(0));

            for(i = 0; i < absTerms.length; i++){
                absTerms[i] = new LambdaAbstraction(absTerms[i], genVarName());
            }

            var appTerms = [];
            var x = 0;

            for(var m = 1; m <= n-2; m++){
                for(var i = 0; i <= k.length; i++){
            
                    var lhsTerms = generatePlanarTermsHelper(m, k.slice(0, i));
                    var rhsTerms = generatePlanarTermsHelper(n-1-m, k.slice(i));

                    for(a = 0; a < lhsTerms.length; a++){
                        for(b = 0; b < rhsTerms.length; b++){
                            appTerms[x] = new LambdaApplication(lhsTerms[a], rhsTerms[b]);
                            x++;
                        }
                    }
                }
            }

            terms = absTerms.concat(appTerms);
            break;

    }

    return terms;

}

/**
 * Generate all linear lambda terms with a given number of subterms and free variables.
 * @param {number} n - The number of subterms.
 * @param {number} k - The number of free variables.
 * @return {Object[]} The array of generated terms.
 */
function generateLinearTerms(n, k){
    
    varName = 0;

    var ks = [];

    for(var i = k - 1; i >= 0; i--){
        ks[k-i-1] = i;
    }

    return generateLinearTermsHelper(n, ks);
}

/**
 * Generate all linear lambda terms with a given number of subterms and free variables.
 * @param {number} n - The number of subterms.
 * @param {number[]} k - The context containing the free variables.
 * @return {Object[]} The array of generated terms.
 */
function generateLinearTermsHelper(n, k){

    var terms = [];

    switch(n){
        case 0:
            break;
        case 1:
            
            if(k.length === 1){
                terms[0] = new LambdaVariable(k[0], "");
            }

            break;
        default:

            var absTerms = generateLinearTermsHelper(n-1, k.map(function(e){return e + 1;}).concat(0));

            for(i = 0; i < absTerms.length; i++){
                absTerms[i] = new LambdaAbstraction(absTerms[i], genVarName());
            }

            var appTerms = [];
            var x = 0;

            var chooses = chooseArrays(k);

            for(var m = 1; m <= n-2; m++){
                for(var i = 0; i < chooses.length; i++){
            
                    var ks1 = chooses[i];
                    var ks2 = k.filter(function(e){return !(ks1.includes(e));});

                    var lhsTerms = generateLinearTermsHelper(m, ks1);
                    var rhsTerms = generateLinearTermsHelper(n-1-m, ks2);

                    for(a = 0; a < lhsTerms.length; a++){
                        for(b = 0; b < rhsTerms.length; b++){
                            appTerms[x] = new LambdaApplication(lhsTerms[a], rhsTerms[b]);
                            x++;
                        }
                    }
                }
            }

            terms = absTerms.concat(appTerms);
            break;
    }

    return terms;

}

/**
 * Get all the different ways an array can have elements selected from it.
 * @param {Object[]} xs - The array to choose elements from.
 * @return {Object[[]]} All the different ways elements can be chosen.
 */
function chooseArrays(xs){

    var arrays = [];

    for(i = 0; i <= xs.length; i++){
        arrays = arrays.concat(chooseElems(xs, i));
    }

    return arrays;

}

/**
 * Get all the different ways a number of elements can be chosen from an array.
 * @param {Object[]} xs   - The array to choose elements from.
 * @param {number}   k    - The number of elements to choose.
 * @return {Object[[]]} All the different ways elements can be chosen.
 */
function chooseElems(xs, k){
    return chooseElemsHelper(xs, k, []);
}

/**
 * Get all the different ways a number of elements can be chosen from an array.
 * @param {Object[]} xs     - The array to choose elements from.
 * @param {number}   k      - The number of elements to choose.
 * @param {Object[]} acc    - An accumulator.
 * @return {Object[[]]} All the different ways elements can be chosen.
 */
function chooseElemsHelper(xs, k, acc){

    if(k === 0){
        return [[]];
    }

    if(xs.length === k){
        return acc.concat([xs]);
    }

    var otherArrays = chooseElems (xs.slice(1), k-1);

    return chooseElemsHelper(xs.slice(1), k, (acc.concat(otherArrays.map(function(e){return [xs[0]].concat(e)}))));

}