function generateTerms(n, k){
    
    var terms = [];

    switch(n){
        case 0:
            break;
        case 1:
            for(i = 0; i < k-1; i++){
                terms[i] = new LambdaVariable(i, "");
            }
            break;
        default:

            var absTerms = generateTerms(n-1, k+1);

            for(i = 0; i < absTerms.length; i++){
                absTerms[i] = new LambdaAbstraction(absTerms[i], "");
                console.log(absTerms[i].prettyPrint());
            }

            var appTerms = [];

            for(n1 = 1; n1 < n-2; n1++){
                
                var lhsTerms = generateTerms(n1, k);
                var rhsTerms = generateTerms(n-1-n1, k);
                var x = 0;

                for(i = 0; i < lhsTerms.length; i++){
                    for(j = 0; i < rhsTerms.length; i++){
                        appTerms[x] = new LambdaApplication(lhsTerms[i], rhsTerms[j]);
                        console.log(appTerms[x]);
                        x++;
                    }
                }
            }

            terms = absTerms.concat(appTerms);

    }

    return terms;

}