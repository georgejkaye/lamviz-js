/**
 * Functions related to the gallery page, such as processing input or changing elements.
 * 
 * @author George Kaye
 */

var terms;
var completeTerms;

var cys;
var ctx;
var currentTermNo = 0;
var termString = "";
var totalNumber = 0;

var n = 0;
var k = 0;
var cross = 0;
var abs = 0;
var apps = 0;
var vars = 0;
var betas = 0;
var fragment = "";

var lastAction = 0;

/**
 * Change the text of an element with a given id.
 * @param {string} id   - The id of the element.
 * @param {string} text - the text to change to
 */
function changeText(id, text){
    document.getElementById(id).innerHTML = text;
}

/**
 * Change the value of an element with a given id.
 * @param {string} id   - The id of the element.
 * @param {string} value - the value to change to
 */
function changeValue(id, value){
    document.getElementById(id).value = value;
}

/**
 * Change the value of elements with a given class.
 * @param {string} id   - The class of the elements.
 * @param {string} value - the value to change to
 */
function changeValueClass(className, value){
    var elems = document.getElementsByClassName(className);

    for(var i = 0; i < elems.length; i++){
        elems[i].value = value;
    }
}

/**
 * Set the style of an span with a given class.
 * @param {string} className - The class of the elements.
 * @param {string} style - The style to set.
 */
function setStyleSpan(className, style){
    var elems = document.getElementsByClassName(className);
    
    var re = /class="(.+?)"/g

    for(var i = 0; i < elems.length; i++){
        elems[i].setAttribute("style", style);

        var subs = elems[i].innerHTML;
        var matches = subs.match(re);
        
        for(var j = 0; j < matches.length; j++){
            var elems2 = document.getElementsByClassName(matches[j].substring(7, matches[j].length - 1));

            for(var k = 0; k < elems2.length; k++){
                elems2[k].setAttribute("style", style);
            }
        }
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
 * @param {boolean} prev - If this is not a new generation of terms (e.g. a filter or sort).
 */
function generateButton(x, prev){

    changeText("normalisation-studio", "");

    if(!prev){
        n = parseInt(getText('n'));
        k = parseInt(getText('k'));
        lastAction = x;
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
            completeTerms = [];
            cys = [];
            freeVariables = new LambdaEnvironment();

            for(var i = 0; i < k; i++){
                freeVariables.pushTerm(i);
            }

            switch(lastAction){
                case 0:
                    completeTerms = generateTerms(n, k);
                    fragment = "pure";
                    break;
                case 1:
                    completeTerms = generateLinearTerms(n, k);
                    fragment = "linear";
                    break;
                case 2:
                    completeTerms = generatePlanarTerms(n, k);
                    fragment = "planar";
                    break;
            }

            totalNumber = completeTerms.length;
        }

        filterAndSortTerms();
        drawGallery();
    }

}

/**
 * Draw a gallery of generated terms.
 * @param {boolean} prev - If the terms have previously been generated.
 */
function drawGallery(prev){
    
    var filteredNumber = terms.length;

    termString = "";

    for(i = 0; i < terms.length; i++){

        terms[i].generatePrettyVariableNames(freeVariables);

        var x = terms[i].prettyPrintLabels(freeVariables).length;
        var size = 200;

        while(x > 20){
            size -= 3;
            x--;
        }

        var termName = "";

        if(document.getElementById('de-bruijn').checked){
            termName = terms[i].prettyPrint();
        } else {
            termName = printTermHTML(terms[i]);
        }

        var caption = getP("caption", "portrait-caption-" + i, "font-size:" + size + "%", "", termName + "<br>" + terms[i].crossings() + " crossings");

        if(document.getElementById("draw").checked){
            termString += getDiv('w3-container frame', 'frame' + i, "", "viewPortrait('church-room', terms[" + i + "], false);", 
                        getDiv("w3-container inner-frame", "", "", "", getDiv("w3-container portrait", "portrait" + i, "", "", "")) + "<br>" + 
                            caption);            

        } else {
            termString += getDiv('w3-container frame empty', 'frame ' + i, "", "viewPortrait('church-room', terms[" + i + "], false);", caption);
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

    var percentage = 0;

    if(totalNumber != 0){
        percentage = (filteredNumber / totalNumber) * 100;
        changeText('help', 'Click on a term to learn more about it. ' + getButton("clear-btn", "clearButton()", "Clear all", false));
    }

    changeText('number-of-terms', numString + " match the filtering criteria: "  + percentage.toFixed(2) + "%");

    ctx = new LambdaEnvironment();

    for(var i = 0; i < k; i++){
        ctx.pushTerm("f" + i, lambda + "f" + i + ".");
    }

    if(document.getElementById("draw").checked){
        if(prev){
            for(var i = 0; i < terms.length; i++){
                drawMap("portrait" + i, terms[i], ctx, false, false, false);
            }
        }
        
        for(var i = 0; i < terms.length; i++){
            cys[i] = drawMap("portrait" + i, terms[i], ctx, false, false, false);
        }
    }
    
    scrollToElement('filtering-options');

}

var a = 0;

/**
 * Function to execute when the clear button is pressed.
 */
function clearButton(){
    changeText('church-room', "");
    changeText('number-of-terms', "");
    changeText('help', "");
    changeText('normalisation-studio', "");
    changeValueClass('number-box', "");
    scrollToElement();
}

/**
 * Function to execute when the back button is pressed.
 */
function backButton(){
    changeText('normalisation-studio', "");
    generateButton(lastAction, true);
    reduced = false;
    scrollToElement('number-of-terms');
}

/**
 * Function to execute when the filter and sort button is pressed.
 */
function filterAndSortButton(){
    filterAndSortTerms();
    drawGallery();
}

const DEFAULT = 0;
const BETA_HIGH_LOW = 1;
const BETA_LOW_HIGH = 2;

/**
 * Filter and sort the current gallery based on the criteria specified by the user.
 */
function filterAndSortTerms(){

    var mode = document.getElementById("sort").selectedIndex;

    terms = completeTerms;

    cross = parseInt(getText('crossings'));
    apps = parseInt(getText('applications'));
    abs = parseInt(getText('abstractions'));
    vars = parseInt(getText('variables'));
    betas = parseInt(getText('betas'));

    if(!isNaN(cross)){
        terms = completeTerms.filter(x => x.crossings() === cross);
    }

    if(!isNaN(apps)){
        terms = completeTerms.filter(x => x.applications() === apps);
    }
    
    if(!isNaN(abs)){
        terms = completeTerms.filter(x => x.abstractions() === abs);
    }
    
    if(!isNaN(vars)){
        terms = completeTerms.filter(x => x.crossings() === vars);
    }

    if(!isNaN(betas)){
        terms = completeTerms.filter(x => x.betaRedexes() === betas);
    }

    switch(mode){
        case BETA_HIGH_LOW:
            terms = sortTermsBeta(terms, false);
            break;
        case BETA_LOW_HIGH:
            terms = sortTermsBeta(terms, true);
            break;
    }
}

/**
 * Sort terms by the number of beta redexes they have.
 * @param {Object[]} termList - The list of terms to sort.
 * @param {boolean} order - If to sort them from high to low (false) or low to high (true).
 * @return {Object[]} The sorted list of terms.
 */
function sortTermsBeta(termList, order){

    if (termList.length <= 1){
        return termList;
    }

    var pivot = termList.shift();

    console.log("length: " + termList.length);
    console.log(pivot.betaRedexes());

    var highers = sortTermsBeta(termList.filter(x => x.betaRedexes() >= pivot.betaRedexes()), order);
    var lowers = sortTermsBeta(termList.filter(x => x.betaRedexes() < pivot.betaRedexes()), order);

    console.log("higher than " + pivot + ": " + highers);
    console.log("lower than " + pivot + ": " + lowers);

    if (order){
        return lowers.concat([pivot].concat(highers));
    }

    return highers.concat([pivot].concat(lowers));
 
}