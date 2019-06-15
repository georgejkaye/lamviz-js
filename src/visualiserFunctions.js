/**
 * Functions related to the visualiser page, such as processing input or changing elements.
 * 
 * @author George Kaye
 */

var functions = [];

/**
 * Pressing Enter triggers the 'Execute' button.
 */
var input = document.getElementById('input');

input.addEventListener("keyup", function(event){
    event.preventDefault();
    if(event.keyCode === 13){
        document.getElementById("execute-btn").click();
    }
})


/**
 * Function to execute when the 'execute' button is pressed.
 */
function executeButton(){

    var error = false;
    var text = getValue('input');

    if(text === ""){
        error = true;
        text = "Type an expression";
    } else {
        text = tokenise(text);
    }
    
    var frees = getValue('env').split(" ");
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
        viewPortrait("church-room", currentTerm, true, false);
    }

    reduced = false;
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

    var functionName = getValue("function-name");
    var functionBody = getValue("function-body");

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

    functionName = functionName.replace(/</g, "&lt;");
    functionName = functionName.replace(/>/g, "&gt;");

    if(functionName.split(" ").length > 1){
        error = functionName + ": Alias names must not contain spaces";
    } else {

        var frees = getValue('env').split(" ");
        freeVariables = new LambdaEnvironment();

        for(i = 0; i < frees.length; i++){
            freeVariables.pushTerm(frees[i]);
        }       

        var tokened = tokenise(functionBody);
        
        if(typeof tokened !== "string"){
            var parsedFunctionBody = parse(tokened, freeVariables);

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
        } else {
            error = functionName + ": " + tokened;
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
   
    var text = getValue("bulk-box");

    if(text !== ""){

        var split1 = text.split("\n\n");
        var error = "";

        for(var i = 0; i < split1.length; i++){
            var split2 = split1[i].split("\n");
            split2[0] = split2[0].replace(/</g, "&lt;");
            split2[0] = split2[0].replace(/>/g, "&gt;");

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
    changeText("bulk", '<button type = "button" id = "bulk-btn" onclick = "revealBulkButton();">Bulk define aliases</button><button type = "button" id = "clear-all-btn" onclick = "removeFunctionsButton();">Clear all</button>');
}