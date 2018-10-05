/**
 * Parse a lambda term
 */

function parseTerm(text){

    tokenise(text);

    const len = text.length;

    console.log("Input: " + text);
    console.log("Input length: " + len.toString());

    var character = 0;

    var parseError = false;
    var currentAbstraction = "";

    while(character < len){
    
        while(index < len){

            var currentCharacter = text.charAt(index);
            
            switch(currentCharacter){
                
                // beginning of a lambda abstraction
                case '\\':
                    abstraction = true;
                    break;

                // end of a lambda abstraction
                case '.':
                    if(abstraction){
                        // TODO deal with abstraction
                    } else {
                        // dot with no associated lambda is a parse error
                        parseError = true
                        break;
                    }

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
                
    
    
        }
    
    
    }

}