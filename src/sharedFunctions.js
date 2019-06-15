/**
 * Functions used by all pages.
 * 
 * @author George Kaye
 */

var currentTerm;
var freeVariables = new LambdaEnvironment();
var originalTerm;

/* Details about the currently viewed big frame */
var currentFrame;
var exhibit;

var reduced = false;
var reducing = false;
var bigScreen = false;
var cyNormCurrent;
var cyMapCurrent;
var cyMapWidthCurrent;
var cyNormHeightCurrent;

var imageWindow;

const fullScreenWidth = "96vw";
const fullScreenHeight = "92vh";

/** The redex currently being highlighted, -1 if no redex */
var activeRedex = -1;

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
 * Scroll the page so an element is at the top.
 * @param {string} id - The id of the element (if undefined, the top of the page).
 * @param {number} offset - The amount to offset the element by.
 */
function scrollToElement(id, offset){

    var y = 0;

    if(offset === undefined){
        offset = 0;
    }

    if(id !== undefined){
        var rec = document.getElementById(id).getBoundingClientRect();
        var y = rec.top + window.scrollY;  
    }

    window.scrollTo(0, y + offset);
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
 * Get the value of an element with a given id.
 * @param {string} id - The id of the element.
 * @return {string} The value of the element.
 */
function getValue(id){
    return document.getElementById(id).value;
}

/**
 * Get the HTML of an element with a given id.
 * @param {string} id - The id of the element.
 * @return {string} The HTML of the element.
 */
function getHTML(id){
    return document.getElementById(id).innerHTML;
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
 * Get the HTML for a <span>.
 * @param {string} className - The class of this <span>.
 * @param {string} id - The id of this <span>.
 * @param {string} style - The style of this <span>.
 * @param {string} onclick - The onclick of this <span>.
 * @param {string} content - The content of this <span>.
 * @return {string} The corresponding HTML for this <span>.
 */
function getSpan(className, id, style, onclick, content){
    return getElement("span", className, id, style, onclick, content);
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
 
/** Get the HTML for a <td>
 * @param {string} content - The content of this <tr>.
 * @return {string} The corresponding HTML for this <tr>.
 */
function getCell(className, content){
    return '<td class="' + className + '">' + content + "</td>";

}

/**
 * Get the HTML for a radio button
 * @param {string} id       - The id of this radio button.
 * @param {string} name     - The name of the radio group.
 * @param {string} value    - The value submitted by this radio button.
 * @param {string} onclick  - What to do when this button is clicked.
 * @param {boolean} checked - Whether this button is initially checked.
 * @param {string} label    - The label for this radio button.
 * @return {string} The corresponding HTML for this radio button.
 */
function getRadioButton(id, name, value, onclick, checked, label){

    var check = "";

    if(checked){
        check = "checked";
    }

    return '<input type="radio" id="' + id + '" name="' + name + '" value="' + value + '" onclick = "' + onclick + '" ' + check + '/>' +
                '<label for="' + id + '">' + label + '</label>';
}

/**
 * Get the HTML for a <button type = "button">.
 * @param {string} id - The id for this <button>.
 * @param {string} onclick - The onclick for this <button>.
 * @param {string} text - The text for this <button>.
 * @param {boolean} disabled - If this button is disabled.
 * @return {string} The corresponding HTML for this <button>.
 */
function getButton(id, onclick, text, disabled){

    var disabled = "";

    if(disabled){
        disabled = "disabled";
    }

    return '<button type = "button" ' + disabled + ' id = "' + id + '" onclick = "' + onclick + '">' + text + '</button>';
}

/**
 * Get the HTML for a bulleted list of elements in an array.
 * @param {Object[]} array - The array.
 * @param {string} id - The id to prefix elements with.
 * @param {string} onmouseover - The script to execute when on mouseover.
 * @return {string} The HTML code for the bulleted list.
 */
function bulletsOfArray(array, id, onclick, onmouseenter, onmouseout){

    var string = "<ul>";
    
    for(var i = 0; i < array.length; i++){
        string += '<li id="' + id + '-' + i + '" onclick="' + onclick.replace("i,", i + ",") + '" onmouseenter="' + onmouseenter.replace("i,", i + ",") + '" onmouseout="' + onmouseout.replace("i,", i + ",") + '">' + array[i] + "</li>";
    }

    string += "</ul>";

    return string;

}

/**
 * Get an HTML representation of a term.
 * @param {Object} term - The lambda term.
 * @param {boolean} deBruijn - Whether to use de Bruijn indices.
 * @return {string} The HTML representation.
 */
function printTermHTML(term, deBruijn){
    return term.printHTML(deBruijn, freeVariables)[0];
}

/**
 * Get the stats for a lambda term in an HTML table format.
 * @param {Object} currentTerm - The lambda term.
 * @param {boolean} labels - If the labels should be displayed on the map.
 * @param {number} exhibit - The exhibit the stats are being displayed in.
 * @return {string} The HTML table code for the stats.
 */
function getStats(currentTerm, labels){
    return getRow(getCell("term-heading", '<b id = "term-name">' + printTermHTML(currentTerm, false) + '</b>')) +
            getRow(getCell("term-subheading", '<b id = "term-name-bruijn">' + printTermHTML(currentTerm, true) + '</b>')) +
            getRow(getCell("term-fact", 'Crossings: ' + currentTerm.crossings())) +
            getRow(getCell("term-fact", 'Abstractions: ' + currentTerm.abstractions())) +
            getRow(getCell("term-fact", 'Applications: ' + currentTerm.applications())) +
            getRow(getCell("term-fact", 'Variables: ' + currentTerm.variables())) +
            getRow(getCell("term-fact", 'Free variables: ' + currentTerm.freeVariables())) +
            getRow(getCell("term-fact", 'Beta redexes: ' + currentTerm.betaRedexes())) +
            getRow(getCell("term-fact", bulletsOfArray(currentTerm.printRedexes(freeVariables), "redex", "clickRedexOnclick(i,)", "highlightRedexMouseover(i, true)", "unhighlightRedexMouseover(i, true)"))) +
            getRow(getCell("border-top", getP("", "", "", "", getRadioButton("yes-labels", "labels", "yes-labels", "updateLabels(true)", labels, "Show labels") + getRadioButton("no-labels", "labels", "no-labels", "updateLabels(false)", !labels, "No labels")))) +
            getRow(getCell("", getButton("fullScreen-btn", "fullScreenMapButton();", "Full screen", false) +
                                getButton("reset-btn", "resetViewButton();", "Reset view", true) +
                                getButton("reset-btn", "resetButton();", "Reset to original term", true) + 
                                getButton("export-btn", "exportButton(true)", "Export map", false)
            )) +
            getRow(getCell("", getButton("normalise-btn", "normaliseButton()", "Normalise") + getButton("watch-reduction-btn", "playReduction()", "Watch normalisation") +
                                '<select id="strategy">' +
                                    "<option value=0>Outermost</value>" +
                                    "<option value=1>Innermost</value>" +
                                    "<option value=2>Random</value>" +
                                "<select>")) +
            getRow(getCell("", getButton("back-btn", "backButton();", "Back", false))) +
            getRow(getCell("", "<br>")) +
            getRow(getCell("term-fact", "<b>Normalisation graph options<b>")) +
            getRow(getCell("", 'Draw maps (very costly for large maps) <input type = "checkbox" id = "normalisation-maps" checked>')) +
            getRow(getCell("", 'Draw arrows (very costly for large maps) <input type = "checkbox" id = "normalisation-arrows" checked>')) +
            getRow(getCell("", 'Draw labels (can get cluttered for large maps) <input type = "checkbox" id = "normalisation-labels" checked>')) +
            getRow(getCell("", getButton("norm-btn", "showNormalisationGraph()", "View normalisation graph", false)));
}

/**
 * Function to execute when a portrait is clicked.
 * @param {string} exhibit - The id of where the portrait is to be drawn.
 * @param {Object} term - The term to draw.
 * @param {boolean} label - If the labels should be drawn on the map.
 * @param {boolean} fullscreen - If the map should be drawn fullscreen.
 * @param {number} i - The id of the portrait to draw.
 */
function viewPortrait(exhibitName, term, label, full, i){

    exhibit = exhibitName;
    bigScreen = full;

    currentTerm = term;

    if(i === undefined){
        i = 0;
    }

    currentFrame = i;

    if(!bigScreen){
        changeText(exhibit, '<table>' +
                                        '<tr>' +
                                            '<td>' + getDiv("w3-container frame big-frame", "frame" + currentFrame, "", "", getDiv("w3-container portrait", "portrait" + i, "", "", "")) + '</td>' +
                                            '<td>' +
                                                '<table>' + 
                                                    getStats(currentTerm, label) +   
                                                '</table>' +
                                            '</td>' +
                                        '</tr>' +
                                    '</table>'
        )
    } else {
        changeText(exhibit, getDiv("w3-container frame full-frame", "frame" + currentFrame, "", "", getDiv("w3-container portrait", "portrait" + currentFrame, "", "", "")) + '<br>' +
                            getSpan("term-heading", "term-name", "", "", "<b>" + printTermHTML(currentTerm, false) + "</b>&ensp;") + getSpan("term-subheading", "", "", "", "<b>" + printTermHTML(currentTerm, true) + "</b>") +                    
                            getDiv("","","","", getButton("fullScreen-btn", "exitFullScreenMapButton(\'" + exhibit + "\');", "Exit full screen") +
                            getButton("watch-reduction-btn", "playReduction()", "Watch normalisation") +
                            '<select id="strategy">' +
                                "<option value=0>Outermost</value>" +
                                "<option value=1>Innermost</value>" +
                                "<option value=2>Random</value>" +
                            "<select>" +
                            getButton("normalise-button", "normaliseButton()", "Normalise") +
                            getButton("reset-button", "resetViewButton()", "Reset to original view") +
                            getButton("reset-view-button", "resetButton()", "Reset to original term") + 
                            getRadioButton("yes-labels", "labels", "yes-labels", "updateLabels(true)", label, "Show labels") + 
                            getRadioButton("no-labels", "labels", "no-labels", "updateLabels(false)", !label, "No labels"))
        );
    }

    var map = drawMap('portrait' + currentFrame, currentTerm, freeVariables, true, true, label);
    cyMapCurrent = map[0];
    cyMapWidthCurrent = map[1];
    
    scrollToElement("church-room");
}

/**
 * Find out if labels should be shown on the drawn map.
 * @return {boolean} if labels should be shown on the drawn map.
 */
function showLabels(){
    return document.getElementById('yes-labels').checked;
}

/**
 * Function to execute when the reset button is pressed.
 */
function resetButton(){

    if(reduced){
        currentTerm = originalTerm;
        viewPortrait(exhibit, currentTerm, showLabels(), bigScreen, currentFrame);
        reduced = false;
    }
}

/**
 * Function to execute when the reset view button is pressed.
 */
function resetViewButton(){
    viewPortrait(exhibit, currentTerm, showLabels(), bigScreen, currentFrame);
}

/**
 * Function to execute when the export button is pressed.
 * @param {boolean} map - Whether to export the map or the normalisation graph
 */
function exportButton(map){

    var scale = 1;
    var png64;

    if(map){
        scale = 5000 / cyMapWidthCurrent;
        png64 = cyMapCurrent.png({
            bg: '#fff',
            full: true,
            scale: scale
        });
    } else {
        scale = 5000 / cyNormHeightCurrent;
        png64 = cyNormCurrent.png({
            bg: '#fff',
            full: true,
            scale: scale,
            maxWidth: 10000,
            maxHeight: 10000
        });
    }

    imageWindow = window.open(png64, '_blank');
}

/**
 * Highlight a redex from a mouseover, providing a reduction animation is not playing.
 * @param {number} i - The redex to highlight.
 */
function highlightRedexMouseover(i){
    if(!reducing){
        highlightRedex(i);
    }
}

/**
 * Get an appropriate colour from an index (cycles through the good colours of the rainbow).
 * @param {number} i - The index to get a colour from.
 * @return {string} The corresponding colour.
 */
function getColour(i){
    
    var colour = "";

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

    return colour;
}

/**
 * Highlight a redex.
 * @param {number} i - The redex to highlight.
 */
function highlightRedex(i){

    var colour = getColour(i);
    setStyleSpan("beta-" + i, "color:" + colour);
    toggleHighlight(true, "beta-" + i, colour);

}

/**
 * Unhighlight an already highlighted redex from a mouseover, providing an animation is not taking place.
 * @param {number} i - The redex to unhighlight.
 */
function unhighlightRedexMouseover(i){
    if(!reducing){
        unhighlightRedex(i);
    }
}

/**
 * Unhighlight an already highlighted redex.
 * @param {number} i - The redex to unhighlight.
 */
function unhighlightRedex(i){
    
    var colour = getColour(i);
    setStyleSpan("beta-" + i, "color:black");
    toggleHighlight(false, "beta-" + i, colour);
}

/**
 * Function to execute when you click a redex, providing an animation is not playing.
 */
function clickRedexOnclick(i){
    if(!reducing){
        clickRedex(i);
    }
}

/**
 * Reduce one of the redexes.
 * @param {number} i - The redex clicked.
 */
function clickRedex(i){

    performReductionAnimationStepOne(i);
    
    if(!reduced){
        reduced = true;
        originalTerm = currentTerm;
    }
    
    currentTerm = specificReduction(currentTerm, i)[0];

    changeText("term-name", printTermHTML(currentTerm, false));
    changeText("term-name-bruijn", printTermHTML(currentTerm, true));

    /*var normalisedTerm = specificReduction(currentTerm, i)[0];
    normalisedTerm.generatePrettyVariableNames(freeVariables);

    if(!reduced){
        reduced = true;
        originalTerm = currentTerm;
    }

    currentTerm = normalisedTerm;
    viewPortrait("church-room", currentTerm, showLabels(), bigScreen, i); */
}

const OUTERMOST = 0;
const INNERMOST = 1;
const RANDOM = 2;

/**
 * Watch a term get reduced to its normal form (if it has one - it'll probably crash otherwise).
 * @param {boolean} subcall - If this is a subcall.
 * @param {number} strat - The strat to use, if this is a subcall.
 */
function playReduction(subcall, strat){

    scrollToElement("church-room");
    var redexes = currentTerm.betaRedexes();
    reducing = true;

    if(redexes !== 0){

        if(strat === undefined){
            strat = document.getElementById("strategy").selectedIndex;
        }

        var chosenRedex = 0;

        /* The chosen redex depends on the reduction strategy */
        switch(strat){
            case OUTERMOST:
                chosenRedex = 0;
                break;
            case INNERMOST:
                chosenRedex = redexes - 1;
                break;
            case RANDOM:
                chosenRedex = Math.floor(Math.random() * redexes);
                break;
        }

        const delay = 1000;

        if(subcall){
            setTimeout(function(){
                setTimeout(function(){
                            setTimeout(playReduction(true, strat), delay); 
                            clickRedex(chosenRedex)
                }, delay); 
                highlightRedex(chosenRedex)
            }, delay);
        } else {
            setTimeout(function(){
                setTimeout(playReduction(true, strat), delay / 2); 
                clickRedex(chosenRedex);
            }, delay / 2); 
            highlightRedex(chosenRedex);
        }
    } else {
        reducing = false;
    }
}

/**
 * Function to execute when the normalise button is pressed.
 */
function normaliseButton(){

    var normalisedTerm = normalise(currentTerm);
    normalisedTerm.generatePrettyVariableNames(freeVariables);

    if(!reduced){
        originalTerm = currentTerm;
        reduced = true;
    }

    currentTerm = normalisedTerm;
    viewPortrait(exhibit, currentTerm, showLabels(), bigScreen, currentFrame);
}

/**
 * Function to execute when the full screen button is pressed.
 */
function fullScreenMapButton(){
    viewPortrait(exhibit, currentTerm, showLabels(), true, currentFrame);
}

/**
 * Function to execute when the exit full screen button is pressed.
 */
function exitFullScreenMapButton(){
    viewPortrait(exhibit, currentTerm, showLabels(), false, currentFrame);
}

/**
 * Show the normalisation graph for the current term.
 */
function showNormalisationGraph(){

    currentReductions = new ReductionGraph(currentTerm);

    changeText('normalisation-studio', '<table>' +
                                            '<tr>' +
                                                '<td>' + 
                                                    getDiv("w3-container frame graph-frame", "normalisation-graph-frame", "", "", getDiv("w3-container portrait", "normalisation-graph", "", "", "")) + 
                                                '</td>' +
                                                '<td id = "norm-graph-stats">' +
                                                    getNormalisationGraphText(false) + 
                                                '</td>'
    );
    
    var norm = drawNormalisationGraph("normalisation-graph", currentTerm, freeVariables, document.getElementById('normalisation-maps').checked, document.getElementById('normalisation-labels').checked, document.getElementById('normalisation-arrows').checked);
    cyNormCurrent = norm[0];
    cyNormHeightCurrent = norm[1];

    document.getElementById("reset-btn").disabled = false;
    scrollToElement('normalisation-studio');

}

/**
 * Get the text to accompany the normalisation graph.
 * @param {boolean} pathStats - Whether to include the path stats.
 * @return {string} The text to accompany the normalisation graph.
 */
function getNormalisationGraphText(pathStats){

    var pathStatsText = "";

    if(pathStats){

        var mean = currentReductions.meanPathToNormalForm();

        if(typeof mean === "number"){
            mean = mean.toFixed(2);
        }

        pathStatsText = getRow(getCell("term-fact", 'Total paths: ' + currentReductions.totalPathsToNormalForm())) +
                        getRow(getCell("term-fact", 'Shortest path: ' + currentReductions.shortestPathToNormalForm())) +
                        getRow(getCell("term-fact", 'Longest path: ' + currentReductions.longestPathToNormalForm())) +
                        getRow(getCell("term-fact", 'Mean path: ' + mean)) + 
                        getRow(getCell("term-fact", 'Median path: ' + currentReductions.medianPathToNormalForm())) + 
                        getRow(getCell("term-fact", 'Mode path: ' + currentReductions.modePathToNormalForm()));
    } else {
        pathStatsText = getRow(getCell("", getButton('show-stats-btn', 'showPathStatsButton()', "Calculate path statistics", false))) + 
                            getRow(getCell("", "Generating the path stats can take a very long time for large graphs!"));
    }
    
    return '<table>' + 
                getRow(getCell("term-fact", 'Vertices: ' + currentReductions.vertices())) +
                getRow(getCell("term-fact", 'Edges: ' + currentReductions.edges())) +
                pathStatsText +
                getRow(getCell("", getButton('fullscreen-norm-btn', 'fullScreenNormalisationGraphButton()', "Full screen", false))) +
                getRow(getCell("", getButton('clear-norm-btn', 'clearNormalisationGraph()', "Back", false))) +
                getRow(getCell("", getButton('export-norm-btn', 'exportButton(false)', "Export graph", false))) +
           '</table>';
}

/**
 * Change the size of the current normalisation graph on screen.
 * @param {string} width - The style for the width.
 * @param {string} height - The style for the height.
 */
function changeFrameSizeGraph(width, height){
    document.getElementById("normalisation-graph-frame").style.width = width;
    document.getElementById("normalisation-graph-frame").style.height = height;
    document.getElementById("normalisation-graph").style.width = "100%";
    document.getElementById("normalisation-graph").style.height = "100%";
    var norm = drawNormalisationGraph("normalisation-graph", currentTerm, freeVariables, document.getElementById('normalisation-maps').checked, document.getElementById('normalisation-labels').checked, document.getElementById('normalisation-arrows').checked);
    cyNormCurrent = norm[0];
    cyNormHeightCurrent = norm[1];
}

/**
 * Function to execute when the show path stats button is pressed.
 */
function showPathStatsButton(){

    currentReductions.calculatePathStats();
    changeText("norm-graph-stats", getNormalisationGraphText(true));

}

/**
 * Function to execute when the full screen normalisation graph button is pressed.
 */
function fullScreenNormalisationGraphButton(){

    changeText('normalisation-studio', getDiv("w3-container frame graph-frame", "normalisation-graph-frame", "", "", getDiv("w3-container portrait", "normalisation-graph", "", "", "")) + '<br>' +
                            getDiv("","","","", getButton("fullScreen-btn", "exitFullScreenNormalisationGraphButton();", "Exit full screen"))
    );

    changeFrameSizeGraph(fullScreenWidth, fullScreenHeight);
    scrollToElement('normalisation-studio');
}

/**
 * Function to execute when the exit full screen normalisation graph button is pressed.
 */
function exitFullScreenNormalisationGraphButton(){
    showNormalisationGraph();
}

/**
 * Function to execute when the clear normalisation graph button is pressed.
 */
function clearNormalisationGraph(){
    changeText('normalisation-studio', "");
    scrollToElement('church-room');
}