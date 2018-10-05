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

    return initial + index;

}

/**
 * Parse a lambda term
 * @param {*} text  the text to parse for a lambda term
 */
function parse(text){
    return parseTerm(text, 0);
}

/**
 * Parse a lambda term
 * @param {*} text the text to parse for a lambda term
 * @param {*} initial the index to start counting from (for debugging)
 */
function parseTerm(text, initial){

    const len = text.length;

    console.log("Input to parse: " + text);
    //console.log("Input length: " + len.toString());

    var index = 0;

    var abstraction = false;
    var parseError = false;
    var currentAbstraction = "";
    var currentVariable = "";
    var currentSubterm = "";
    var newSubterm;
    var oldSubterm;

    // variables for function application
    var app = false;  // are we parsing the second part of an application?
    var app1;
    var app2;

    while(index < len){

        var currentCharacter = text.charAt(index);
        
        //console.log("Character " + index + ": " + currentCharacter);

        switch(currentCharacter){
            
            // beginning of a lambda abstraction
            case '\\':
                abstraction = true;
                break;

            // end of a lambda abstraction
            case '.':
                if(abstraction){
                    // TODO deal with abstraction
                    console.log("Lambda abstraction: " + currentAbstraction);

                    var scope = findClosingBracket(index, text.substring(index + 1)) + 1;

                    if(scope === -1){
                        scope = len - 1;
                    }

                    var t = text.substring(index + 1, scope);
                    if(t.charAt(0) === ' '){
                        t = t.substring(1);
                        index++;
                    }

                    console.log("Scope of \u03BB" + currentAbstraction + ": " + t);
                    
                    // parse the subterm
                    const t1 = parseTerm(t, index + 1);

                    // create this new lambda abstraction
                    // \x. t
                    return new LambdaAbstraction(t1, currentAbstraction)
                    
                } else {
                    // dot with no associated lambda is a parse error
                    parseError = true
                    break;
                }

                break;

            // start of a subterm
            case '(':

                const end = findClosingBracket(index, text.substring(index + 1));

                if(end === len){
                    parseError = true;
                }

                console.log("Subterm: " + text.substring(index + 1, end));

                var t1 = parseTerm(text.substring(index + 1, end), index + 1);
                index++;

                break;

            // floating close bracket (all close brackets dealt with in the subterm process) 
            // parse error
            case ')':

                parseError = true;
                break;

            case ' ':
                // end of a variable/term
               
                // abstractions cannot have spaces in them
                if(abstraction){
                    parseError = true;
                } else {
                    newSubterm = parseTerm(currentSubterm, index)
                    
                    if(app){
                        newSubterm = new LambdaApplication(oldSubterm, newSubterm);
                    } else {
                        app = true;
                    }

                    currentSubterm = "";
                
                }

                break;

            default:

                if (abstraction){
                    currentAbstraction += currentCharacter;
                } else {
                    currentSubterm += currentCharacter;
                }
                
                break;
        } 
        
        if(parseError){
            console.log("Error parsing \'" + text.charAt(index) + "\' at character " + (initial + index));
        }

        index++;
    }

    console.log("New variable: " + currentSubterm);
    return new LambdaVariable(currentSubterm);
}