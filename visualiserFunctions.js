/**
 * Functions related to the html page, such as processing input or changing elements.
 * 
 * @author George Kaye
 */

var functions = [];

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
            text = term.prettyPrint() + " ~  ~  ~ " + term.prettyPrintLabels(freeVariables);
            changeText('result', "");
        } else {
            text = term;
            error = true;
            changeText('result', text);
        }
    } else {
        error = true;
        changeText('result', text);
        changeText('church-room', "");
    }

    changeText('normalisation-studio', "");

    if(!error){
        viewPortrait("church-room", currentTerm, document.getElementById('labels-yes').checked);
    }

    reduced = false;
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

        var text = res.prettyPrint() + " ~ ~ ~ " + res.prettyPrintLabels(freeVariables);

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
        var text = res.prettyPrint() + " ~ ~ ~ " + res.prettyPrintLabels(freeVariables);

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

    var text = res.prettyPrint() + " ~ ~ ~ " + res.prettyPrintLabels(freeVariables);

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
    drawNormalisationGraph('normalisation-graph', currentTerm, freeVariables, document.getElementById('normalisation-maps').checked);

}

/**
 * Function to execute when the reset button is pressed.
 */
function resetButton(labels){
    changeText('normalisation-studio', "");
    if(reduced && currentTerm !== originalTerm){
        originalTerm.generatePrettyVariableNames(freeVariables);
        viewPortrait("church-room", originalTerm, document.getElementById("labels-yes").checked);
        reduced = false;
        currentTerm = originalTerm;
    }
}

/**
 * Function to execute when the back button is pressed.
 */
function backButton(){
    changeText('church-room', "");
    changeText('normalisation-studio', "");
    reduced = false;
    scrollToElement();
}

/**
 * Function to execute when the define button is pressed.
 */
function defineFunction(functionName, functionBody){

    var functionName = getText("function-name");
    var functionBody = getText("function-body");

    functionName.replace("<", "\<");

    var error = addFunction(functionName, functionBody);

    if(error === ""){
        changeValue("function-name", "");
        changeValue("function-body", "");
        updateFunctionsList();
    } else {
        changeText("result", error);
    }
}

/**
 * Add a new alias to the list of functions.
 * @param {string} functionName - The name of this function.
 * @param {string} functionBody - The raw string input for the function body.
 * @return {string} An error message, if appropriate.
 */
function addFunction(functionName, functionBody){
    
    var error = "";

    if(functionName.split(" ").length > 1){
        error = functionName + ": Alias names must not contain spaces";
    } else {

        var frees = getText('env').split(" ");
        freeVariables = new LambdaEnvironment();

        for(i = 0; i < frees.length; i++){
            freeVariables.pushTerm(frees[i]);
        }       

        var parsedFunctionBody = parse(tokenise(functionBody), freeVariables);

        if(typeof parsedFunctionBody !== "string"){

            parsedFunctionBody.generatePrettyVariableNames(freeVariables);

            var functionDefinition = [functionName, parsedFunctionBody, parsedFunctionBody.prettyPrintLabels(freeVariables)];
            var exists = false;

            for(var i = 0; i < functions.length; i++){
                if(functions[i][0] === functionName){
                    exists = true;
                    functions[i][1] = functionDefinition[1];
                    functions[i][2] = functionDefinition[2];
                }
            }

            if(!exists){
                smartPush(functions, functionDefinition);
            }
        } else {
            error = functionName + ": " + parsedFunctionBody;
        }
    }

    return error;
}

/**
 * Clear the entire aliases list.
 */
function removeFunctionsButton(){
    functions = [];
    updateFunctionsList();
}

/**
 * Update the list of aliases displayed on the screen.
 */
function updateFunctionsList(){
    
    var string = "";
    
    for(var i = 0; i < functions.length; i++){
        string += "<b>" + functions[i][0] + "</b> = " + functions[i][2] + "<br>";
    }

    changeText("function-list", string);
}

/**
 * Function to execute when the reveal bulk aliases box is pressed.
 */
function revealBulkButton(){
    changeText('bulk', "<table>" + 
                            "<tr>" +
                                '<td>Define multiple aliases as follows: <br><br> <i>Function1</i> <br> <i>\\x.x</i> <br> <br> <i>Function2</i> <br> <i>\\x.\\y.x y <br> <br> <i>Function3</i> <br> <i>\\x.\\y.y x</td>' + 
                                '<td><textarea id = "bulk-box" style="height:200px; width: 200px;text-align:top"></textarea></td>' +
                            "</tr>" +
                        "</table>" +
                        "<br>" +
                        getButton("bulk-btn", "bulkButton();", "Bulk define aliases", false) + 
                        getButton("hide-btn", "hideButton()", "Hide", false)
    )
}

/**
 * Function to execute when the bulk aliases definition button is pressed (i.e. parse all the aliases given).
 */
function bulkButton(){
   
    var text = getText("bulk-box");

    if(text !== ""){

        var split1 = text.split("\n\n");
        var error = "";

        for(var i = 0; i < split1.length; i++){
            var split2 = split1[i].split("\n");
            split2[0].replace("<", "\<");
            
            if(split2.length !== 2){
                error = split2[0] + ": missing function body";
            } else {

                var newError = addFunction(split2[0], split2[1]);

                if(newError !== ""){
                    error += "\n" + newError;
                }
            }
            
        }

        if(error === ""){
            hideButton();
        } else {
            changeText("result", error);
        }

        updateFunctionsList();
    }
}

/**
 * Function to execute when the hide button is pressed.
 */
function hideButton(){
    changeText("bulk", '<button type = "button" id = "bulk-btn" onclick = "revealBulkButton();">Bulk define aliases</button>');
}