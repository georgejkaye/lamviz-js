/**
 * Functions to generate terms from various fragments of the lambda calculus.
 * 
 * @author George Kaye
 */

/**
 * Generate all pure lambda terms with a given number of subterms and free variables.
 * @param {number} n - The number of subterms.
 * @param {number} k - The number of free variables.
 * @return {Object[]} The array of generated terms.
 */
function generateTerms(n, k){

    var terms = [];

    switch(n){
        case 0:
            break;
        case 1:
            for(i = 0; i <= k-1; i++){
                terms[i] = new LambdaVariable(i, "");
            }
            break;
        default:

            var absTerms = generateTerms(n-1, k+1);

            for(i = 0; i < absTerms.length; i++){
                absTerms[i] = new LambdaAbstraction(absTerms[i], "");
            }

            var appTerms = [];
            var x = 0;

            for(var m = 1; m <= n-2; m++){
                
                var lhsTerms = generateTerms(m, k);
                var rhsTerms = generateTerms(n-1-m, k);

                for(a = 0; a < lhsTerms.length; a++){
                    for(b = 0; b < rhsTerms.length; b++){
                        appTerms[x] = new LambdaApplication(lhsTerms[a], rhsTerms[b]);
                        x++;
                    }
                }
            }

            terms = absTerms.concat(appTerms);

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

    if(typeof k === "number"){

         var tempArray = [];

         for(var i = k - 1; i >= 0; i--){
             tempArray[k-i-1] = i;
         }

         k = tempArray;

    }

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

            var absTerms = generatePlanarTerms(n-1, terms.map(function(e){return e + 1;}).concat([0]));

            for(i = 0; i < absTerms.length; i++){
                absTerms[i] = new LambdaAbstraction(absTerms[i], "");
            }

            var appTerms = [];
            var x = 0;

            for(var m = 1; m <= n-2; m++){
                for(var i = 0; i <= k.length; i++){
            

                    var lhsTerms = generatePlanarTerms(m, k.slice(0, i));
                    var rhsTerms = generatePlanarTerms(n-1-m, k.slice(i));

                    for(a = 0; a < lhsTerms.length; a++){
                        for(b = 0; b < rhsTerms.length; b++){
                            appTerms[x] = new LambdaApplication(lhsTerms[a], rhsTerms[b]);
                            x++;
                        }
                    }
                }
            }

            terms = absTerms.concat(appTerms);

    }

    return terms;

}