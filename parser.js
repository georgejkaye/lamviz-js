import * as def from "definition";

/**
 * Parse a lambda term
 */

function parseTerm(text){

    const len = text.length;

    console.log("Input: " + text);
    console.log("Input length: " + len.toString());

    var index = 0;

    var parseError = false;
    var currentAbstraction = "";

    var term;

    while(index < len){

        var currentCharacter = text.charAt(index);
        
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

                // TODO
                break;

            case ')':

                // TODO
                break;

            case ' ':
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