/**
 * Functions for interacting with HTML.
 * 
 * @author George Kaye
 */

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