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

/** If this is not the originally visualised term */
var reduced = false;
/** If a normalisation is being played */
var reducing = false;
/** If the term is in normal form */
var normalForm = false;
/** If we are in full screen */
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

/** Parse an integer from some text, returning -1 if the text is not an integer.
 *  @param {string} text - The text to parse.
 *  @return {number} the integer from the text, or -1 if not an integer.
 */
function parseIntOrEmpty(text){

    var int = parseInt(text);
    
    return (isNaN(int) ? -1 : int);
}

/**
 * Get the stats for a lambda term in an HTML table format.
 * @param {Object} currentTerm - The lambda term.
 * @param {boolean} labels - If the labels should be displayed on the map.
 * @param {number} exhibit - The exhibit the stats are being displayed in.
 * @return {string} The HTML table code for the stats.
 */
function getStats(currentTerm, labels){

    var selectDisabled = "";

    if(normalForm){
        selectDisabled = "disabled";
    }

    return getRow(getCell("term-heading", '<b id = "term-name">' + printTermHTML(currentTerm, false) + '</b>')) +
            getRow(getCell("term-subheading", '<b id = "term-name-bruijn">' + printTermHTML(currentTerm, true) + '</b>')) +
            getRow(getCell("term-fact", 'Subterms: ' + currentTerm.subterms())) +
            getRow(getCell("term-fact", 'Crossings: ' + currentTerm.crossings())) +
            getRow(getCell("term-fact", 'Abstractions: ' + currentTerm.abstractions())) +
            getRow(getCell("term-fact", 'Applications: ' + currentTerm.applications())) +
            getRow(getCell("term-fact", 'Total variables: ' + currentTerm.variables())) +
            getRow(getCell("term-fact", 'Unique variables: ' + currentTerm.uniqueVariables())) +
            getRow(getCell("term-fact", 'Free variables: ' + currentTerm.freeVariables())) +
            getRow(getCell("term-fact", 'Beta redexes: ' + currentTerm.betaRedexes())) +
            getRow(getCell("term-fact", bulletsOfArray(currentTerm.printRedexes(freeVariables), "redex", "clickRedexOnclick(i,)", "highlightRedexMouseover(i, true)", "unhighlightRedexMouseover(i, true)"))) +
            getRow(getCell("border-top", getP("", "", "", "", getRadioButton("yes-labels", "labels", "yes-labels", "updateLabels(true)", labels, "Show labels") + getRadioButton("no-labels", "labels", "no-labels", "updateLabels(false)", !labels, "No labels")))) +
            getRow(getCell("", getButton("fullScreen-btn", "fullScreenMapButton();", "Full screen", false) +
                                getButton("reset-btn", "resetViewButton();", "Reset view", false) +
                                getButton("reset-btn", "resetButton();", "Reset to original term", !reduced) + 
                                getButton("export-btn", "exportButton(true)", "Export map", false)
            )) +
            getRow(getCell("", getButton("normalise-btn", "normaliseButton()", "Normalise", normalForm) + getButton("watch-reduction-btn", "playReduction()", "Watch normalisation", normalForm) +
                                '<select ' + selectDisabled + ' id="strategy">' +
                                    "<option value=0>Outermost</value>" +
                                    "<option value=1>Innermost</value>" +
                                    "<option value=2>Random</value>" +
                                "<select>" +
                                getButton("stop-btn", "stopNormalisationPlayback()", "Stop", !reducing))) +
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

    normalForm = (currentTerm.betaRedexes() === 0);

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
        reduced = false;
        viewPortrait(exhibit, currentTerm, showLabels(), bigScreen, currentFrame);
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
        reducing = true;
        clickRedex(i);
        setTimeout(function(){
            reducing = false;
        }, 1750);
    }
}

/**
 * Reduce one of the redexes.
 * @param {number} i - The redex clicked.
 */
function clickRedex(i){

    performReductionAnimation(i);
 
    setTimeout(function(){
        var normalisedTerm = specificReduction(currentTerm, i)[0];
        normalisedTerm.generatePrettyVariableNames(freeVariables);

        if(!reduced){
            reduced = true;
            originalTerm = currentTerm;
        }

        currentTerm = normalisedTerm;

        if(currentTerm.betaRedexes() === 0){
            reducing = false;
        }

        viewPortrait("church-room", currentTerm, showLabels(), bigScreen, i);
    }, 1750);

}

const OUTERMOST = 0;
const INNERMOST = 1;
const RANDOM = 2;
var stop = false;

/**
 * Watch a term get reduced to its normal form (if it has one - it'll probably crash otherwise).
 * @param {boolean} subcall - If this is a subcall.
 * @param {number} strat - The strat to use, if this is a subcall.
 */
function playReduction(subcall, strat){

    scrollToElement("church-room");
    var redexes = currentTerm.betaRedexes();
    reducing = true;

    if(!subcall){
        stop = false;
    }

    if(redexes !== 0 && !stop){

        document.getElementById("stop-btn").disabled = false;

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

        const shortDelay = 500;
        const longDelay = 2000;

        if(subcall){
            setTimeout(function(){
                highlightRedex(chosenRedex);
                setTimeout(function(){
                    clickRedex(chosenRedex);
                    setTimeout(function(){
                        playReduction(true, strat);
                    }, longDelay);
                }, shortDelay);
            }, shortDelay);

        } else {   
            highlightRedex(chosenRedex);  
            setTimeout(function(){
                clickRedex(chosenRedex);
                setTimeout(function(){
                    playReduction(true, strat);
                }, longDelay);
            }, shortDelay);
        }
    } else {
        document.getElementById("stop-btn").disabled = true;
        reducing = false;
    }
}

function stopNormalisationPlayback(){

    stop = true;
    document.getElementById("stop-btn").disabled = true;

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