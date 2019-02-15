/**
 * Functions for parsing lambda terms from user input.
 * 
 * @author George Kaye
 */

/**
 * Parse a lambda term from an array of tokens.
 * @param {string[]} tokens - The tokens to parse for a lambda term.
 * @return {Object} The parsed lambda term.
 */
function parse(tokens, env){

    return parseTerm(tokens, 0, env);
}

/**
 * Parse a lambda term from an array of tokens.
 * @param {string[]}    tokens  - The array of tokens to parse.
 * @param {number}      initial - The index to start counting from.
 * @param {Object}      env     - The current lambda environment
 * @return {Object} The parsed lambda term, or an error string if an unknown variable is detected.
 */
function parseTerm(tokens, initial, env){

    const len = tokens.length;

    var abstractionVariable = "";

    var secondTerm = false;
    var t1;
    var t2;

    var i = 0;
    var pos = 0;

    while(i < len){

        switch(tokens[i]){
            
            /* lambda abstraction, next token must be a variable */
            case '\\':

                i++;
                abstractionVariable = tokens[i]; 

                i++;
                env.pushTerm(abstractionVariable);
                var scope = findScope(tokens.slice(i));

                var t = parseTerm(scope, initial + i, env);

                if(typeof t === "string"){
                    return t;
                }

                t2 = new LambdaAbstraction (t, abstractionVariable);
                i += scope.length;
                env.popTerm();

                break;

            /* start of a subterm */
            case '(':

                i++;
                var scope = findScope(tokens.slice(i));
                t2 = parseTerm(scope, initial + i, env);

                if(typeof t2 === "string"){
                    return t2;
                }

                i += (scope.length - 1);

                break;

            /* end of a subterm */
            case ')':
                
                return t1;

            /* otherwise */
            default:

                var index = env.find(tokens[i]);
                var label = env.getCorrespondingVariable(index);

                if(index === -1){
                    return "Parse error: Variable " + tokens[i] + " with no associated binding encountered";
                }

                t2 = new LambdaVariable(index, label, pos);
                pos++;
                break;
                
        } 

        if(secondTerm){
                t1 = new LambdaApplication(t1, t2);
        } else {
                t1 = t2;
                secondTerm = true;
        }

        i++;
    }

    return t1;
}

/**
 * Find the scope of a lambda abstraction from an array of tokens.
 * @param {array of tokens} tokens - The tokens succeeding a lambda abstraction.
 * @return {array of tokens} The tokens that are under the current scope.
 */
function findScope(tokens){

    var j = -1;
    brackets = 1;

    while(brackets > 0 && j < tokens.length){

        j++;

        if(tokens[j] === '('){
            brackets++;
        } else if (tokens[j] === ')'){
            brackets--;
        }

    }

    return tokens.slice(0, j + 1);

}

/**
 * Tokenise an input string.
 * @param {string} text - The string to tokenise.
 * @return {string[]} The tokenised string in an array.
 */
function tokenise(text){

    const len = text.length;
    var tokens = [];

    var string = "";
    var brackets = 0;

    var abstraction = false;
    var awaitingContent = false;

    var parseError = false;
    var parseNumber = 0;
    var errorMessage = "";

    for(i = 0; i < len; i++){

        const currentCharacter = text.charAt(i);

        switch(currentCharacter){

            /* a dot can only follow an abstraction */
            case '.':
                if(!abstraction){
                    parseError = true;
                    errorMessage = "Abstraction expected but none in progress";
                } else {
                    abstraction = false;

                    if(string === ""){
                        parseError = true
                        errorMessage = "No variable given for lambda abstraction";
                    }

                    tokens = pushString(tokens, string);
                    string = "";
                    awaitingContent = true;
                }
                break;

            /* a space can only indicate a gap between terms, and cannot occur inside strings */
            case ' ':
                if(abstraction){
                    parseError = true;
                    errorMessage = "Variable expected after lambda abstraction";
                } else {
                    tokens = pushString(tokens, string);
                    string = "";
                }
                break;

            /* a closing bracket must have a matching opening bracket */
            case ')':
                brackets--;

                if(brackets < 0){
                    parseError = true;
                    errorMessage = "No opening bracket";
                } else {
                    tokens = pushString(tokens, string);
                    string = "";
                    tokens = pushString(tokens, currentCharacter);
                }

                break;

            /* beginning of an abstraction */
            case '\\':
                abstraction = true;
                tokens = pushString(tokens, string);
                string = "";
                tokens = pushString(tokens, currentCharacter);
                break;

            /* start of a subterm, need to check there is a matching closing bracket */
            case '(':
                tokens = pushString(tokens, string);
                string = "";
                const x = findClosingBracket(i, text.substring(i));

                if(x === -1){
                    parseError = true;
                    errorMessage = "No closing bracket"
                } else {
                    brackets++;
                    tokens = pushString(tokens, currentCharacter);
                }
                break;

            /* any other character is part of a string */
            default:
                string += currentCharacter;
                awaitingContent = false;
                break;
        }

        if(parseError){
            return "Parse error, character " + i + ": " + errorMessage;
        }

    }

    /* push whatever is left at the end */
    if(string !== ""){
        tokens = pushString(tokens, string);
    }

    if(awaitingContent){
        return "Parse error, unexpected end of input";
    }

    return tokens;

}

/**
 * Push a string into an array, checking to make sure it isn't empty.
 * @param {array}   array  - The array to push the string into.
 * @param {string}  string - The string to push into the array.
 * @return {array} The array with the string pushed into it.
 */
function pushString(array, string){
    
    if(string !== ""){
        array = smartPush(array, string);
    }

    return array;
}

/**
 * Push something into an array, overwriting the first element if it is empty.
 * @param {array}   array   - The array to push into.
 * @param {any}      item    - The item to push into the array.
 */
function smartPush(array, item){

    if(array[0] === ""){
        array[0] = item;
    } else {
        array.push(item);
    }

    return array;

}

/**
 * Find the index of the appropriate closing bracket - i.e. the end of the term.
 * @param {number} initial  - The initial index of the term in the whole string.
 * @param {string} text     - The text to search for the closing bracket.
 * @return The index of the closing bracket (or -1 if there isn't one).
 */
function findClosingBracket(initial, text){

    const len = text.length;
    var index = 0;
    var brackets = 0;

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
