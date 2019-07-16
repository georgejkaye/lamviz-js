/**
 * Functions related to the gallery page, such as processing input or changing elements.
 * 
 * @author George Kaye
 */

var terms = [];
var completeTerms = [];

/* [[cat1, [cat1_0, ... , cat1_n]], ... , [catn, [catn_0, ... , catn_n]]] */
var sortedCategories = [];

var cys;
var ctx;
var currentTermNo = 0;
var totalNumber = 0;

var n = 0;
var k = 0;
var cross = -1;
var abs = -1;
var apps = -1;
var vars = -1;
var betas = -1;
var fragment = "";

/* Sort constants */
const DEFAULT = 0;
const CROSSINGS_HIGH_LOW = 1;
const CROSSINGS_LOW_HIGH = 2;
const BETA_HIGH_LOW = 3;
const BETA_LOW_HIGH = 4;

/* Functions for properties */
const defaultProperty = x => x.id;
const redexesProperty = x => x.betaRedexes();
const crossingsProperty = x => x.crossings();

/* Text for properties */
const redexesPlural = "&beta;-redexes";
const redexesSingle = "&beta;-redex";
const crossingsPlural = "crossings";
const crossingsSingle = "crossing";

var propertyFunction;
var propertySingle;
var propertyPlural;

var lastAction = 0;
var lastSortMode = DEFAULT;

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

    if(isNaN(n)){
        changeText('error', "Parse error: bad value of n");
        clearButton(false);
    } else {
        changeText('error', "");

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

            for(var i = 0; i < completeTerms.length; i++){
               completeTerms[i].id = i;
            }

            terms = completeTerms;
            totalNumber = completeTerms.length;

        }

        filterTerms();
        sortTerms(true);
        drawGallery();
        document.getElementById('sort-btn').disabled = false;
    }

}

/**
 * Draw a gallery of generated terms.
 * @param {boolean} prev - If the terms have previously been generated.
 */
function drawGallery(prev){
    
    var filteredNumber = terms.length;
    var termString = "";

    var portraitCount = 0;

    for(var i = 0; i < sortedCategories.length; i++){

        if(sortedCategories[i][0] !== ""){
            termString += getDiv("", "category-" + i, "", "", getH("","", 3, "", "", sortedCategories[i][0]));
        }

        for(var j = 0; j < sortedCategories[i][1].length; j++){

            var workingTerm = sortedCategories[i][1][j]

            workingTerm.generatePrettyVariableNames(freeVariables);

            var x = workingTerm.prettyPrintLabels(freeVariables).length;
            var size = 200;

            while(x > 20){
                size -= 3;
                x--;
            }

            var termName = "";

            if(document.getElementById('de-bruijn').checked){
                termName = workingTerm.prettyPrint();
            } else {
                termName = printTermHTML(workingTerm);
            }

            var caption = getSpan("caption", "portrait-caption-" + portraitCount, "font-size:" + size + "%", "", termName) + getSpan("subcaption", "portrait-subcaption-" + portraitCount, "", "", "<br>&#x2a09; " + workingTerm.crossings() + "&emsp;&beta; " + workingTerm.betaRedexes());

            if(document.getElementById("draw").checked){
                termString += getDiv('w3-container frame', 'frame' + portraitCount, "", "viewPortrait('church-room', sortedCategories[" + i + "][1][" + j + "], false);", 
                            getDiv("w3-container inner-frame", "", "", "", getDiv("w3-container portrait", "portrait" + portraitCount, "", "", "")) + "<br>" + 
                                caption);            

            } else {
                termString += getDiv('w3-container frame empty', 'frame ' + portraitCount, "", "viewPortrait('church-room', sortedCategories[" + i + "][1][" + j + "], false);", caption);
            }

            portraitCount++;
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
        changeText('help', 'Click on a term to learn more about it. ' + getButton("clear-btn", "clearButton(true)", "Clear all", false));
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
 * @param {boolean} nums - Whether to clear the number boxes.
 */
function clearButton(nums){
    changeText('church-room', "");
    changeText('number-of-terms', "");
    changeText('help', "");
    changeText('normalisation-studio', "");
    
    if(nums){
        changeValueClass('number-box', "");
    }

    scrollToElement();
    document.getElementById('sort-btn').disabled = true;
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
    
    var filterChanged = filterTerms()
    var sortChanged = sortTerms(filterChanged);
    
    if(filterChanged || sortChanged){
        drawGallery();
    }
}

/**
 * Filter the current gallery based on the criteria specified by the user.
 * @return {boolean} If the list of terms or the order has been changed.
 */
function filterTerms(){

    var changed = false;
    var newCross = parseIntOrEmpty(getText('crossings'));
    var newApps = parseIntOrEmpty(getText('applications'));
    var newAbs = parseIntOrEmpty(getText('abstractions'));
    var newVars = parseIntOrEmpty(getText('variables'));
    var newBetas = parseIntOrEmpty(getText('betas'));

    if(newCross !== cross || newApps !== apps || newAbs !== abs || newVars !== vars || newBetas !== betas){
        changed = true;
        terms = completeTerms;
        cross = newCross;
        apps = newApps;
        abs = newAbs;
        vars = newVars;
        betas = newBetas;
    }

    if(cross !== -1){
        terms = completeTerms.filter(x => x.crossings() === cross);
    }

    if(apps !== -1){
        terms = completeTerms.filter(x => x.applications() === apps);
    }
    
    if(abs !== -1){
        terms = completeTerms.filter(x => x.abstractions() === abs);
    }
    
    if(vars !== -1){
        terms = completeTerms.filter(x => x.crossings() === vars);
    }

    if(betas !== -1){
        terms = completeTerms.filter(x => x.betaRedexes() === betas);
    }

    return changed;
}

/**
 * Filter the current gallery based on the method specified by the user.
 * @param {boolean} filter - If the filter has changed and so the categories need to be recalculated.
 * @return {boolean} If the list of terms or the order has been changed.
 */
function sortTerms(filter){

    var changed = false;

    var mode = document.getElementById("sort").selectedIndex;

    if(mode !== lastSortMode){
        
        changed = true;
        lastSortMode = mode;

        switch(mode){
            case DEFAULT:
                order = true;
                propertyFunction = defaultProperty;
                break;
            case CROSSINGS_HIGH_LOW:
                order = false;
                propertyFunction = crossingsProperty;
                propertyNameSingle = crossingsSingle;
                propertyNamePlural = crossingsPlural;
                break;
            case CROSSINGS_LOW_HIGH:
                order = true;
                propertyFunction = crossingsProperty;
                propertyNameSingle = crossingsSingle;
                propertyNamePlural = crossingsPlural;
                break;
            case BETA_HIGH_LOW:
                order = false;
                propertyFunction = redexesProperty;
                propertyNameSingle = redexesSingle;
                propertyNamePlural = redexesPlural;
                break;
            case BETA_LOW_HIGH:
                order = true;
                propertyFunction = redexesProperty;
                propertyNameSingle = redexesSingle;
                propertyNamePlural = redexesPlural;
                break;
        }

        terms = quickSortTerms(terms, propertyFunction, order);
    }

    if(mode !== DEFAULT){

        var c = 0;
        var currentProperty = propertyFunction(terms[0]);

        var propertyName = currentProperty === 1 ? propertyNameSingle : propertyNamePlural;
        
        sortedCategories =  [];
        sortedCategories[0] = [currentProperty + " " + propertyName, [terms[0]]];

        for(var i = 1; i < terms.length; i++){
            
            var newProperty = propertyFunction(terms[i]);

            if(currentProperty !== newProperty){
                c++;
                propertyName = newProperty === 1 ? propertyNameSingle : propertyNamePlural;
                sortedCategories[c] = [propertyFunction(terms[i]) + " " + propertyName, [terms[i]]];
                currentProperty = newProperty;
            } else {
                smartPush(sortedCategories[c][1], terms[i]);
            }
        }
    } else {
        sortedCategories[0] = ["", terms];
    }

    return changed;
}

/**
 * Sort terms by a certain property that they have.
 * @param {Object[]} termList - The list of terms to sort.
 * @param {function} propertyFunction - The function to get the property to sort by.
 * @param {boolean} order - If to sort them from high to low (false) or low to high (true).
 * @return {Object[]} The sorted list of terms.
 */
function quickSortTerms(termList, propertyFunction, order){

    if (termList.length <= 1){
        return termList;
    }

    var pivot = termList[0];
    termList = termList.slice(1);

    var highers = quickSortTerms(termList.filter(x => propertyFunction(x) >= propertyFunction(pivot)), propertyFunction, order);
    var lowers = quickSortTerms(termList.filter(x => propertyFunction(x) < propertyFunction(pivot)), propertyFunction, order);

    if (order){
        return lowers.concat([pivot].concat(highers));
    }

    var temp = [pivot].concat(lowers);
    return highers.concat(temp);
 
}