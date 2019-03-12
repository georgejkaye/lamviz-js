/**
 * Functions related to the gallery page, such as processing input or changing elements.
 * 
 * @author George Kaye
 */

var terms;
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
 * @param {number} n - A previously specified n (optional).
 * @param {number} k - A previously specified k (optional).
 */
function generateButton(x, prev){

    changeText("normalisation-studio", "");

    if(!prev){
        n = parseInt(getText('n'));
        k = parseInt(getText('k'));
        cross = parseInt(getText('crossings'));
        apps = parseInt(getText('applications'));
        abs = parseInt(getText('abstractions'));
        vars = parseInt(getText('variables'));
        betas = parseInt(getText('betas'));
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
            terms = [];
            cys = [];
            freeVariables = new LambdaEnvironment();

            for(var i = 0; i < k; i++){
                freeVariables.pushTerm(i);
            }

            switch(lastAction){
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

            totalNumber = terms.length;
        }

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

        if(!isNaN(betas)){
            terms = terms.filter(x => x.betaRedexes() === betas);
        }

        var filteredNumber = terms.length;

        termString = "";

        for(i = 0; i < terms.length; i++){

            terms[i].generatePrettyVariableNames(freeVariables);

            var x = terms[i].prettyPrintLabels(freeVariables).length;
            var size = 200;

            while(x > 20){
                size -= 2;
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

        drawGallery(false, terms, ctx);
        scrollToElement('number-of-terms');

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
                drawMap("portrait" + i, terms[i], ctx, false, false, false);
            }
        }
        
        for(var i = 0; i < terms.length; i++){
            cys[i] = drawMap("portrait" + i, terms[i], ctx, false, false, false);
        }
    }
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