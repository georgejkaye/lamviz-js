/**
 * Functions related to the html page, such as processing input or changing elements.
 * 
 * @author George Kaye
 */

/**
 * Function to execute when the 'execute' button is pressed.
 */
function executeButton(){

    var error = false;
    var text = getText('input');

    if(text === ""){
        error = true;
        text = "Type an expression";
    } else {
        text = tokenise(text);
    }
    
    var frees = getText('env').split(" ");
    freeVariables = new LambdaEnvironment();

    for(i = 0; i < frees.length; i++){
        freeVariables.pushTerm(frees[i]);
    }

    var term;

    if(typeof text !== "string"){
        term = parse(text, freeVariables)

        if(typeof term !== "string"){
            currentTerm = term;
            text = term.prettyPrint() + " ~  ~  ~ " + term.prettyPrintLabels(true);
        } else {
            text = term;
            error = true;
        }
        changeText('result', "");
    } else {
        error = true;
        changeText('result', text);
        changeText('church-room', "");
    }

    changeText('normalisation-studio', "");

    if(!error){
        viewPortrait("church-room", currentTerm, document.getElementById('labels-yes').checked);
    }
}

/**
 * Function to execute when the 'substitute' button is pressed.
 */
function substituteButton(){

    var s = tokenise(getText('s'));
    var j = getText('j');

    var frees = getText('ctx').split(" ");
    freeVariables = new LambdaEnvironment();

    for(i = 0; i < frees.length; i++){
        freeVariables.pushTerm(frees[i]);
    }

    j = freeVariables.find(j);

    if(j === -1){
        changeText('result', "Variable not in environment");
    } else if(typeof s === "string"){
        changeText('result', s)
    } else {
        var newterm = substitute(parse(s, new LambdaEnvironment()), j, currentTerm);
        changeText('result', newterm.prettyPrint());
    }
}

/**
 * Function to execute when the 'evaluate' button is pressed.
 */
function evaluateButton(){

    var res = evaluate(currentTerm);

    if(res === "Timeout"){
        changeText('result', "Timed out during evaluation");
    } else {

        var text = res.prettyPrint() + " ~ ~ ~ " + res.prettyPrintLabels();

        changeText('result', text);
    }
}

/**
 * Function to execute when the 'normalise' button is pressed.
 */
function normaliseButton(){

    var res = outermostReduction(currentTerm);

    if(res === "Timeout"){
        changeText('result', "Timed out during normalisation");
    } else {

        var frees = getText('env').split(" ");
        freeVariables = new LambdaEnvironment();

        for(i = 0; i < frees.length; i++){
            freeVariables.pushTerm(frees[i]);
        }

        currentTerm = res;
        var text = res.prettyPrint() + " ~ ~ ~ " + res.prettyPrintLabels();

        changeText('result', text);
        drawMap("cy", currentTerm, ctx, true, true, document.getElementById('labels-yes').checked);
    }
}

/**
 * Function to execute when the beta button is pressed.
 */
function betaButton(){

    var frees = getText('ctx').split(" ");
    freeVariables = new LambdaEnvironment();

    for(i = 0; i < frees.length; i++){
        freeVariables.pushTerm(frees[i]);
    }

    var t1 = parse(tokenise(getText('b1')), freeVariables);
    var t2 = parse(tokenise(getText('b2')), freeVariables);

    var res = applicationAbstraction(t1, t2)

    var text = res.prettyPrint() + " ~ ~ ~ " + res.prettyPrintLabels();

    changeText('result', text)

}

/**
 * Function to execute when the generate button is pressed.
 */
function generateButton(x){

    var n = parseInt(getText('n'));
    var k = parseInt(getText('k'));
    var string = "";

    if(isNaN(n) || isNaN(k)){
        string = "Bad input";
    } else {
        var terms;
        
        switch(x){
            case 0:
                terms = generateTerms(n, k);
                break;
            case 1:
                terms = generateLinearTerms(n, k);
                break;
            case 2:
                terms = generatePlanarTerms(n, k);
                break;
        }

        for(i = 0; i < terms.length; i++){
            string += terms[i].prettyPrint() + "<br />";
        }
    }

    changeText('generated-terms', string);
    changeText('enumerated-terms', "There are " + terms.length + " terms");

}

/**
 * Function to execute when the normalisation tree button is pressed.
 */
function normaliseTreeButton(){

    changeText('normalisation-tree', getDiv("w3-container frame graph-frame", "normalisation-graph-frame", "", "", getDiv("w3-container portrait", "normalisation-graph", "", "", "")));
    drawNormalisationGraph('normalisation-graph', currentTerm, freeVariables);

}

/**
 * Function to execute when the reset button is pressed.
 */
function resetButton(labels){
    changeText('normalisation-studio', "");
    if(reduced && currentTerm !== originalTerm){
        viewPortrait("church-room", originalTerm, document.getElementById("labels-yes").checked);
        reduced = false;
    } else { 
        document.getElementById("reset-btn").disabled = true; 
    }
}

/**
 * Function to execute when the back button is pressed.
 */
function backButton(){
    changeText('church-room', "");
    changeText('normalisation-studio', "");
    reduced = false;
}