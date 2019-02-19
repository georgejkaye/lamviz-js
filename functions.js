/**
 * Functions related to the html page, such as processing input or changing elements.
 * 
 * @author George Kaye
 */

var currentTerm;
var freeVariables = new LambdaEnvironment();

/**
 * Get the HTML for an element.
 * @param {string} element - The element type.
 * @param {string} className - The class of this element.
 * @param {string} id - The id of this element.
 * @param {string} style - The style of this element.
 * @param {string} onclick - The onclick of this element.
 * @param {string} content - The content of this element.
 * @return {string} The corresponding HTML for this element.
 */
function getElement(element, className, id, style, onclick, content){
    return '<' + element + ' class="' + className + '" id="' + id + '" style="' + style + '" onclick="' + onclick + '">' + content + '</' + element +'>';
}

/**
 * Get the HTML for a <div>.
 * @param {string} className - The class of this <div>.
 * @param {string} id - The id of this <div>.
 * @param {string} style - The style of this <div>.
 * @param {string} onclick - The onclick of this <div>.
 * @param {string} content - The content of this <div>.
 * @return {string} The corresponding HTML for this <div>.
 */
function getDiv(className, id, style, onclick, content){
    return getElement("div", className, id, style, onclick, content);
}

/**
 * Change the text of an element with a given id.
 * @param {string} id   - The id of the element.
 * @param {string} text - the text to change to
 */
function changeText(id, text){
    document.getElementById(id).innerHTML = text;
}

/**
 * Get the text of an element with a given id.
 * @param {string} id - The id of the element.
 * @return {string} The text of the element.
 */
function getText(id){
    return document.getElementById(id).value;
}

/**
 * Get a 'pretty' string of an array with spaces in between each element.
 * @param {array} array - The array to get the string from.
 */
function prettyString(array){

    if(array.length !== 0){
        var string = array[0];

        if(array.length > 0){
            for(i = 1; i < array.length; i++){
                string += " ";
                string += array[i];
            }
        }
    }

    return string;
}

/**
 * Function to execute when the 'execute' button is pressed.
 */
function execute_button(){

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
            text = term.prettyPrint() + " ~  ~  ~ " + term.prettyPrintLabels(true);
        } else {
            text = term;
            error = true;
        }
    } else {
        error = true;
    }

    changeText('result', text);
    changeText('normalisation-tree', "");

    currentTerm = term;

    if(!error){
        drawMap("cy", currentTerm, freeVariables, true, true, document.getElementById('labels-yes').checked);
    }
}

/**
 * Function to execute when the 'substitute' button is pressed.
 */
function substitute_button(){

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
function evaluate_button(){

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
function normalise_button(){

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
function beta_button(){

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
function generate_button(x){

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
function normalise_tree_button(){

    changeText('normalisation-tree', getDiv("w3-container frame graph-frame", "normalisation-graph-frame", "", "", getDiv("w3-container portrait", "normalisation-graph", "", "", "")));
    drawNormalisationGraph("normalisation-tree", currentTerm, freeVariables);

}