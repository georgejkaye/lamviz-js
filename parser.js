//import * as def from "definition";


/**
 * Find the index of the appropriate closing bracket - i.e. the end of the term
 * @param {*} initial the initial index of the term in the whole string
 * @param {*} text the text to search for the closing bracket
 */
function findClosingBracket(initial, text){

    const len = text.length;
    var index = 0;
    var brackets = 1;

    while(index < len){

        var currentCharacter = text.charAt(index);

        switch(currentCharacter){
            case '(':
                brackets++;
                break;
            case ')':
                brackets--;
                if(brackets === 0){
                    return initial + index + 1;
                }
                break;
            default:
                break;
        }

        index++;
    }

    return -1;

}

/**
 * Parse a lambda term
 * @param {*} text the text to parse for a lambda term
 */
function parseTerm(text){

    const len = text.length;

    console.log("Input to parse: " + text);
    //console.log("Input length: " + len.toString());

    var index = 0;

    var abstraction = false;
    var parseError = false;
    var currentAbstraction = "";

    var term;

    while(index < len){

        var currentCharacter = text.charAt(index);
        
        //console.log("Character " + index + ": " + currentCharacter);

        switch(currentCharacter){
            
            // beginning of a lambda abstraction
            case '\\':
                console.log("abstraction")
                abstraction = true;
                break;

            // end of a lambda abstraction
            case '.':
                if(abstraction){
                    // TODO deal with abstraction
                    console.log(currentAbstraction);
                } else {
                    // dot with no associated lambda is a parse error
                    parseError = true
                    break;
                }

                break;

            case '(':

                const end = findClosingBracket(index, text.substring(index + 1));

                if(end === -1){
                    parseError = true;
                }

                console.log("Subterm: " + text.substring(index + 1, end));

                var t1 = parseTerm(text.substring(index + 1, end));

                break;

            case ')':

                // TODO
                break;

            case ' ':
                // spaces are permitted and can be skipped over
                break;

            default:

                if (abstraction){
                    currentAbstraction += currentCharacter;
                } else {

                // TODO

                }
                
                break;
            

            
        } 
        
        index++;
    }
}