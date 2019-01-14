/**
 * Functions related to the html page, such as processing input or changing elements.
 * 
 * @author George Kaye
 */

var currentTerm;

var terms;
var currentTermNo = 0;

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
            
            string += '<a href="portrait.html?' + i + '"><div class="w3-container frame"><div class="w3-container portrait" id="portrait' + i + '"></div><br><p class="caption" id="portrait-caption-' + i + '">' + terms[i].prettyPrint() + '</p></div></a>'
            //string += '<div class="w3-container frame"><div class="w3-container portrait" id="portrait' + i + '"></div><br><p class="caption" id="portrait-caption-' + i + '">' + terms[i].prettyPrint() + '</p></div>'
            
        }

        changeText('church-room', string);

        var numString = terms.length + " term";

        if(terms.length !== 1){
            numString += "s";
        }

        changeText('number-of-terms', numString + " found");

        var ctx = new LambdaEnvironment();

        for(var i = 0; i < k; i++){
            ctx.pushTerm("f" + i);
        }

        for(var i = 0; i < terms.length; i++){
            drawGraph("portrait" + i, terms[i], ctx, false, false);
        }
    }

}

function setup_portrait(){
    console.log("hello!");
}