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

    }

    return terms;

}