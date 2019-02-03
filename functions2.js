/**
 * Functions related to the html page, such as processing input or changing elements.
 * 
 * @author George Kaye
 */

var currentTerm;
var originalTerm;
var reduced = false;

var terms;
var cys;
var ctx;
var currentTermNo = 0;
var termString = "";

var n = 0;
var k = 0;
var cross = 0;
var abs = 0;
var apps = 0;
var vars = 0;
var fragment = "";

var last_action = 0;

/**
 * Change the text of an element with a given id.
 * @param {string} id   - The id of the element.
 * @param {string} text - the text to change to
 */
function changeText(id, text){
    document.getElementById(id).innerHTML = text;
}

function changeValue(id, text){
    document.getElementById(id).value = text;
}

function changeValueClass(className, text){
    var elems = document.getElementsByClassName(className);

    for(var i = 0; i < elems.length; i++){
        elems[i].value = text;
    }
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

    console.log(array);

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
 * Action to perform when a generate button is performed.
 * @param {number} x - The identifier for the type of terms to generate.
 * @param {number} n - A previously specified n (optional).
 * @param {number} k - A previously specified k (optional).
 */
function generate_button(x, prev){

    if(!prev){
        n = parseInt(getText('n'));
        k = parseInt(getText('k'));
        cross = parseInt(getText('crossings'));
        apps = parseInt(getText('applications'));
        abs = parseInt(getText('abstractions'));
        vars = parseInt(getText('variables'));
        last_action = x;
    }

    var string = "";

    if(isNaN(n)){
        string = "Bad input";
    } else {

        if(isNaN(k)){
            k = 0;
        }

        if(!prev){
            fragment = "";
            terms = [];
            cys = [];
        }
        
        if(!prev){
            switch(last_action){
                case 0:
                    terms = generateTerms(n, k);
                    fragment = "pure";
                    break;
                case 1:
                    terms = generateLinearTerms(n, k);
                    fragment = "linear";
                    break;
                case 2:
                    terms = generatePlanarTerms(n, k);
                    fragment = "planar";
                    break;
            }
        }

        var totalNumber = terms.length;

        if(!isNaN(cross)){
            terms = terms.filter(x => x.crossings() === cross);
        }

        if(!isNaN(apps)){
            terms = terms.filter(x => x.applications() === apps);
        }
        
        if(!isNaN(abs)){
            terms = terms.filter(x => x.abstractions() === abs);
        }
        
        if(!isNaN(vars)){
            terms = terms.filter(x => x.crossings() === vars);
        }


        var filteredNumber = terms.length;

        termString = "";

        for(i = 0; i < terms.length; i++){

            if(document.getElementById("draw").checked){
                termString += get_div('w3-container frame', 'frame' + i, "", 'view_portrait(terms[' + i + ']);', 
                            get_div("w3-container portrait", "portrait" + i, "", "", "") + "<br>" + 
                                get_p("caption", "portrait-caption-" + i, "", "", terms[i].prettyPrint() + "<br>" + terms[i].crossings() + " crossings"));            
 
            } else {
                termString += get_div('w3-container frame empty', 'frame ' + i, "", 'view_portrait(terms[' + i + ']);', get_p("caption", "portrait-caption-" + i, "", "", terms[i].prettyPrint() + "<br>" + terms[i].crossings() + " crossings"));
            }
        }

        changeText('church-room', termString);

        var numString = "There ";
        
        if(totalNumber === 1){
            numString += "is 1 " + fragment + " term";
        } else {
            numString += "are " + totalNumber + " " + fragment + " terms"; 
        }

        numString += " for n = " + n + " and k = " + k + "<br>" +
                        filteredNumber + "/" + totalNumber + " term";

        if(terms.length !== 1){
            numString += "s";
        }

        changeText('number-of-terms', numString + " match the filtering criteria: "  + ((filteredNumber / totalNumber) * 100).toFixed(2) + "%");
        changeText('help', "Click on a term to learn more about it.")

        ctx = new LambdaEnvironment();

        for(var i = 0; i < k; i++){
            ctx.pushTerm("f" + i, lambda + "f" + i + ".");
        }

        drawGallery(false, terms, ctx);

    }

}

/**
 * Draw a gallery of generated terms.
 * @param {boolean} cache - If the terms have previously been generated.
 * @param {terms}   terms - The terms in the gallery.
 * @param {ctx}     ctx   - The context of the gallery.
 */
function drawGallery(cache, terms, ctx){
    
    if(document.getElementById("draw").checked){
        if(cache){
            for(var i = 0; i < terms.length; i++){
                drawGraph("portrait" + i, terms[i], ctx, false, false, false);
            }
        }
        
        for(var i = 0; i < terms.length; i++){
            cys[i] = drawGraph("portrait" + i, terms[i], ctx, false, false, false);
        }
    }
}

function setup_portrait(){
    console.log("hello!");
}

var a = 0;

/**
 * Function to execute when the clear button is pressed.
 */
function clear_button(){
    changeText('church-room', "");
    changeText('number-of-terms', "");
    changeValueClass('number-box', "");
}

function print_array(array){
    var string = "";

    for(var i = 0; i < array.length; i++){
        string += array[i] + ", ";
    }
}

/**
 * Get the HTML for an element.
 * @param {string} element - The element type.
 * @param {string} classname - The class of this element.
 * @param {string} id - The id of this element.
 * @param {string} content - The content of this element.
 * @return {string} The corresponding HTML for this element.
 */
function get_element(element, classname, id, style, onclick, content){
    return '<' + element + ' class="' + classname + '" id="' + id + '" style="' + style + '" onclick="' + onclick + '">' + content + '</' + element +'>';
}

/**
 * Get the HTML for a <div>.
 * @param {string} classname - The class of this <div>.
 * @param {string} id - The id of this <div>.
 * @param {string} content - The content of this <div>.
 * @return {string} The corresponding HTML for this <div>.
 */
function get_div(classname, id, style, onclick, content){
    return get_element("div", classname, id, style, onclick, content);
}

/**
 * Get the HTML for a <p>.
 * @param {string} classname - The class of this <p>.
 * @param {string} id - The id of this <p>.
 * @param {string} content - The content of this <p>.
 * @return {string} The corresponding HTML for this <p>.
 */
function get_p(classname, id, style, onclick, content){
    return get_element("p", classname, id, style, onclick, content);
}

function get_h(classname, id, num, style, onclick, content){
    return get_element("h" + num, classname, id, style, onclick, content);
}
 
/**
 * Function to execute when a portrait is clicked.
 * @param term - The term to draw.
 */
function view_portrait(term){

    currentTerm = term;

    var disabled = '';

    if(!currentTerm.hasBetaRedex()){
        disabled = 'disabled';
    }

    changeText("church-room", '<table>' +
                                    '<tr>' +
                                        '<td>' + get_div("w3-container frame big-frame", "frame" + i, "", "", get_div("w3-container portrait", "portrait" + i, "", "", "")) + '</td>' +
                                        '<td>' +
                                            '<table>' + 
                                                '<tr>' +
                                                    '<td class = "term-heading"><b>' + currentTerm.prettyPrint() + '</b></td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td class = "term-fact">' + 'Crossings: ' + currentTerm.crossings() + '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td class = "term-fact">' + 'Abstractions: ' + currentTerm.abstractions() + '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td class = "term-fact">' + 'Applications: ' + currentTerm.applications() + '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td class = "term-fact">' + 'Variables: ' + currentTerm.variables() + '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td class = "term-fact">' + 'Free variables: ' + currentTerm.freeVariables() + '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td class = "term-fact">' + 'Beta redexes: ' + currentTerm.betaRedexes() + '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td><b>Perform reduction</b></td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td><button type = "button" ' + disabled + ' id = "reduce-btn" onclick = "reduce_button();">Outermost</button></td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td><button type = "button" disabled id = "reset-btn" onclick = "reset_button();">Reset</button><button type = "button" id = "back-btn" onclick = "back_button();">Back</button>' +
                                                '</tr>' +
                                            '</table>' +
                                        '</td>' +
                                    '<tr>' +
                                '</table>'
    )
    drawGraph('portrait' + i, currentTerm, ctx, true, true, false);

}

function back_button(){
    generate_button(last_action, true);
}

function reset_button(){
    if(currentTerm !== originalTerm){
        view_portrait(originalTerm);
    }
}

function reduce_button(){

    var normalised_term = outermostReduction(currentTerm);
    
    if(!reduced){
        reduced = true;
        originalTerm = currentTerm;
    }

    view_portrait(normalised_term);
    document.getElementById("reset-btn").disabled = false; 


}