/**
 * Functions related to the html page, such as processing input or changing elements.
 * 
 * @author George Kaye
 */

var currentTerm;

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
    var text = tokenise(getText('input'));
    var frees = getText('env').split(" ");
    
    var ctx = new LambdaEnvironment();

    for(i = 0; i < frees.length; i++){
        ctx.pushTerm(frees[i]);
    }

    var term;

    if(typeof text !== "string"){
        term = parse(text, ctx)

        if(typeof term !== "string"){
            text = term.prettyPrint() + " ~  ~  ~ " + term.prettyPrintLabels();
        } else {
            text = term;
            error = true;
        }
    } else {
        error = true;
    }

    changeText('result', text);

    currentTerm = term;

    if(!error){
        drawGraph("cy", currentTerm, ctx, true, true);
    }
}

/**
 * Function to execute when the 'substitute' button is pressed.
 */
function substitute_button(){

    var s = tokenise(getText('s'));
    var j = getText('j');

    var frees = getText('ctx').split(" ");
    var ctx = new LambdaEnvironment();

    for(i = 0; i < frees.length; i++){
        ctx.pushTerm(frees[i]);
    }

    j = ctx.find(j);

    if(j === -1){
        changeText('result', "Variable not in ctxironment");
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

    var res = normalise(currentTerm);

    if(res === "Timeout"){
        changeText('result', "Timed out during normalisation");
    } else {

        var text = res.prettyPrint() + " ~ ~ ~ " + res.prettyPrintLabels();

        changeText('result', text);
    }
}

function beta_button(){

    var frees = getText('ctx').split(" ");
    var ctx = new LambdaEnvironment();

    for(i = 0; i < frees.length; i++){
        ctx.pushTerm(frees[i]);
    }

    var t1 = parse(tokenise(getText('b1')), ctx);
    var t2 = parse(tokenise(getText('b2')), ctx);

    var res = applicationAbstraction(t1, t2)

    var text = res.prettyPrint() + " ~ ~ ~ " + res.prettyPrintLabels();

    changeText('result', text)

}

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