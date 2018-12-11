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