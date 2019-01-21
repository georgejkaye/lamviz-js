/**
 * Functions related to the html page, such as processing input or changing elements.
 * 
 * @author George Kaye
 */

var currentTerm;

var terms;
var cys;
var ctx;
var currentTermNo = 0;
var termString = "";

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
 */
function generate_button(x){

    var n = parseInt(getText('n'));
    var k = parseInt(getText('k'));
    var string = "";

    if(isNaN(n) || isNaN(k)){
        string = "Bad input";
    } else {

        terms = [];
        cys = [];
        
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

        termString = "";

        for(i = 0; i < terms.length; i++){
            
            termString += '<div class="w3-container frame" id="frame' + i + '" onclick="view_portrait(' + i + ');"><div class="w3-container portrait" id="portrait' + i + '"></div><br><p class="caption" id="portrait-caption-' + i + '">' + terms[i].prettyPrint() + '</p></div>'
            
        }

        changeText('church-room', termString);

        var numString = terms.length + " term";

        if(terms.length !== 1){
            numString += "s";
        }

        changeText('number-of-terms', numString + " found");

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
    
    if(cache){
        for(var i = 0; i < terms.length; i++){
            drawGraph("portrait" + i, terms[i], ctx, false, false, false);
        }
    }
    
    for(var i = 0; i < terms.length; i++){
        cys[i] = drawGraph("portrait" + i, terms[i], ctx, false, false, false);
    }
}

function setup_portrait(){
    console.log("hello!");
}

var a = 0;

function test(){
    
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
function get_element(element, classname, id, style, content){
    return '<' + element + ' class="' + classname + '" id="' + id + '" style="' + style + '">' + content + '</' + element +'>';
}

/**
 * Get the HTML for a <div>.
 * @param {string} classname - The class of this <div>.
 * @param {string} id - The id of this <div>.
 * @param {string} content - The content of this <div>.
 * @return {string} The corresponding HTML for this <div>.
 */
function get_div(classname, id, style, content){
    return get_element("div", classname, id, style, content);
}

/**
 * Get the HTML for a <p>.
 * @param {string} classname - The class of this <p>.
 * @param {string} id - The id of this <p>.
 * @param {string} content - The content of this <p>.
 * @return {string} The corresponding HTML for this <p>.
 */
function get_p(classname, id, style, content){
    return get_element("p", classname, id, style, content);
}

function get_h(classname, id, num, style, content){
    return get_element("h" + num, classname, id, style, content);
}
 
/**
 * Function to execute when a portrait is clicked.
 * @param i - The portrait id.
 */
function view_portrait(i){
    changeText("church-room", '<table>' +
                                    '<tr>' +
                                        '<td>' + get_div("w3-container frame big-frame", "frame" + i, "", get_div("w3-container portrait", "portrait" + i, "", "")) + '</td>' +
                                        '<td>' +
                                            '<table>' + 
                                                '<tr>' +
                                                    '<td class = "term-heading"><b>' + terms[i].prettyPrint() + '</b></td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td class = "term-fact">' + 'Crossings: ' + terms[i].crossings() + '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td class = "term-fact">' + 'Abstractions: ' + terms[i].abstractions() + '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td class = "term-fact">' + 'Applications: ' + terms[i].applications() + '</td>' +
                                                '</tr>' +
                                                '<tr>' +
                                                    '<td class = "term-fact">' + 'Variables: ' + terms[i].variables() + '</td>' +
                                                '</tr>' +
                                            '</table>' +
                                        '</td>' +
                                    '<tr>' +
                                '</table>'
    )
    drawGraph('portrait' + i, terms[i], ctx, true, true, false);

}