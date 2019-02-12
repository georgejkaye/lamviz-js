/**
 * Functions related to the gallery page, such as processing input or changing elements.
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
            console.log(matches[j].substring(7, matches[j].length - 1));
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
        }
        
        if(!prev){
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

            if(document.getElementById("draw").checked){
                termString += getDiv('w3-container frame', 'frame' + i, "", 'viewPortrait(terms[' + i + ']);', 
                            getDiv("w3-container portrait", "portrait" + i, "", "", "") + "<br>" + 
                                getP("caption", "portrait-caption-" + i, "", "", terms[i].prettyPrint() + "<br>" + terms[i].crossings() + " crossings"));            
 
            } else {
                termString += getDiv('w3-container frame empty', 'frame ' + i, "", 'viewPortrait(terms[' + i + ']);', getP("caption", "portrait-caption-" + i, "", "", terms[i].prettyPrint() + "<br>" + terms[i].crossings() + " crossings"));
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

var a = 0;

/**
 * Function to execute when the clear button is pressed.
 */
function clearButton(){
    changeText('church-room', "");
    changeText('number-of-terms', "");
    changeValueClass('number-box', "");
}

function printArray(array){
    var string = "";

    for(var i = 0; i < array.length; i++){
        string += array[i] + ", ";
    }

    return string.substring(0, string.length - 2);
}

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
 * Get the HTML for a <p>.
 * @param {string} className - The class of this <p>.
 * @param {string} id - The id of this <p>.
 * @param {string} style - The style of this <p>.
 * @param {string} onclick - The onclick of this <p>.
 * @param {string} content - The content of this <p>.
 * @return {string} The corresponding HTML for this <p>.
 */
function getP(className, id, style, onclick, content){
    return getElement("p", className, id, style, onclick, content);
}

/**
 * Get the HTML for a <hx>.
 * @param {string} className - The class of this <h>.
 * @param {string} id - The id of this <h>.
 * @param {number} num - The heading number of this <h>.
 * @param {string} style - The style of this <h>.
 * @param {string} onclick - The onclick of this <h>.
 * @param {string} content - The content of this <h>.
 * @return {string} The corresponding HTML for this <h>.
 */
function getH(className, id, num, style, onclick, content){
    return getElement("h" + num, className, id, style, onclick, content);
}

/**
 * Get the HTML for a <tr>.
 * @param {string} content - The content of this <tr>.
 * @return {string} The corresponding HTML for this <tr>.
 */
function getRow(content){
    return '<tr>' + content + '</tr>'
}
 

function getCell(className, content){
    return '<td class="' + className + '">' + content + "</td>";

}
/**
 * Get the HTML for a bulleted list of elements in an array.
 * @param {Object[]} array - The array.
 * @param {string} id - The id to prefix elements with.
 * @param {string} onmouseover - The script to execute when on mouseover.
 * @return {string} The HTML code for the bulleted list.
 */
function bulletsOfArray(array, id, onmouseenter, onmouseout){

    var string = "<ul>";

    
    for(var i = 0; i < array.length; i++){
        string += '<li id="' + id + '-' + i + '" onmouseenter="' + onmouseenter.replace("(i)", "(" + i + ")") + '" onmouseout="' + onmouseout.replace("(i)", "(" + i + ")") + '">' + array[i] + "</li>";
    }

    string += "</ul>";

    return string;

}

/**
 * Get an HTML representation of a term.
 * @param {Object} term - The lambda term.
 * @return {string} The HTML representation.
 */
function printTermHTML(term){
    return term.printHTML()[0];
}

/**
 * Function to execute when a portrait is clicked.
 * @param term - The term to draw.
 */
function viewPortrait(term){

    currentTerm = term;

    var disabled = '';

    if(!currentTerm.hasBetaRedex()){
        disabled = 'disabled';
    }

    changeText("church-room", '<table>' +
                                    '<tr>' +
                                        '<td>' + getDiv("w3-container frame big-frame", "frame" + i, "", "", getDiv("w3-container portrait", "portrait" + i, "", "", "")) + '</td>' +
                                        '<td>' +
                                            '<table>' + 
                                                getRow(getCell("term-heading", '<b>' + printTermHTML(currentTerm) + '</b>')) +
                                                getRow(getCell("term-fact", 'Crossings: ' + currentTerm.crossings())) +
                                                getRow(getCell("term-fact", 'Abstractions: ' + currentTerm.abstractions())) +
                                                getRow(getCell("term-fact", 'Applications: ' + currentTerm.applications())) +
                                                getRow(getCell("term-fact", 'Variables: ' + currentTerm.variables())) +
                                                getRow(getCell("term-fact", 'Free variables: ' + currentTerm.freeVariables())) +
                                                getRow(getCell("term-fact", 'Beta redexes: ' + currentTerm.betaRedexes())) +
                                                getRow(getCell("term-fact", bulletsOfArray(currentTerm.printRedexes(), "redex", "highlightRedex(i)", "unhighlightRedex(i)"))) +
                                                getRow(getCell("", '<b>Perform reduction</b>')) +
                                                getRow(getCell("", '<button type = "button" ' + disabled + ' id = "reduce-btn" onclick = "reduceButton(0);">Outermost</button><button type = "button" ' + disabled + ' id = "reduce-btn" onclick = "reduceButton(1);">Innermost</button>')) +
                                                getRow(getCell("", '<button type = "button" disabled id = "reset-btn" onclick = "resetButton();">Reset</button><button type = "button" id = "back-btn" onclick = "backButton();">Back</button>')) +
                                            '</table>' +
                                        '</td>' +
                                    '<tr>' +
                                '</table>'
    )
    drawGraph('portrait' + i, currentTerm, ctx, true, true, false);

}

/**
 * Function to execute when the back button is pressed.
 */
function backButton(){
    generateButton(lastAction, true);
    reduced = false;
}

/**
 * Function to execute when the reset button is pressed.
 */
function resetButton(){
    if(currentTerm !== originalTerm){
        viewPortrait(originalTerm);
        reduced = false;
    }
}

/**
 * Function to execute when a reduce button is pressed.
 * @param {number} strat - The reduction strategy to use: 0: outermost, 1: innermost
 */
function reduceButton(strat){

    var normalisedTerm;
    
    switch(strat){
        case 0:
            normalisedTerm = outermostReduction(currentTerm);
            break;
        case 1:
            normalisedTerm = innermostReduction(currentTerm);
            break;
    }
    
    if(!reduced){
        reduced = true;
        originalTerm = currentTerm;
    }

    viewPortrait(normalisedTerm);
    document.getElementById("reset-btn").disabled = false; 

}

function highlightRedex(i){

    var colour = "color:";

    switch(i % 5){
        case 0:
            colour += "red";
            break;
        case 1:
            colour += "orange";
            break;
        case 2:
            colour += "green";
            break;
        case 3:
            colour += "blue";
            break;
        case 4:
            colour += "violet";
            break;
    }

    setStyleSpan("beta-" + i, colour);

}

function unhighlightRedex(i){

    setStyleSpan("beta-" + i, "color:black");

}