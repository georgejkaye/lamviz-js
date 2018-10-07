/**
 * Parse a lambda term
 * @param {*} text  the text to parse for a lambda term
 */
function parse(text){
    return parseTerm(text, 0);
}

/**
 * Parse a lambda term
 * @param {*} tokens the array of tokens to parse
 * @param {*} initial the index to start counting from (for debugging)
 */
function parseTerm(tokens, initial){

    console.log("Parsing term: " + tokens);

    const len = tokens.length;

    // flags
    var abstractionVariable = "";

    var secondTerm = false;
    var t1;
    var t2;

    var i = 0;

    while(i < len){

        console.log("Looking at token " + (initial + i) + ": " + tokens[i]);

        switch(tokens[i]){
            
            // lambda abstraction, next token must be a variable
            case '\\':

                i++;
                console.log("Looking at token " + (initial + i) + ": " + tokens[i]);
                abstractionVariable = tokens[i]; 

                i++;
                var scope = findScope(tokens.slice(i));
                t2 = new LambdaAbstraction (parseTerm(scope, initial + i), abstractionVariable);
                i += scope.length;
                console.log("New abstraction: " + t2.prettyPrint());

                break;

            // start of a subterm
            case '(':

                i++;
                var scope = findScope(tokens.slice(i));
                console.log("Scope of subterm: " + scope);
                console.log("Length of scope: " + scope.length);
                t2 = parseTerm(scope, initial + i);
                i += (scope.length - 1);
                console.log("New subterm: " + t2.prettyPrint());
                console.log("Remaining tokens: " + tokens.slice(i + 1));

                break;

            // end of a subterm
            case ')':
                
                console.log("Returning term: " + t1.prettyPrint());
                return t1;

            // otherwise
            default:
                t2 = new LambdaVariable(tokens[i]);
                break;
                
        } 

        if(secondTerm){
                console.log("Applying " + t2.prettyPrint() + " to " + t1.prettyPrint());
                t1 = new LambdaApplication(t1, t2);
        } else {
                t1 = t2;
                secondTerm = true;
        }

        i++;
    }

    console.log("Returning term: " + t1.prettyPrint());
    return t1;
}

/**
 * Find the scope of a lambda abstraction
 * @param {} array the tokens succeeding a lambda abstraction
 */
function findScope(array){

    var j = -1;
    brackets = 1;

    while(brackets > 0 && j < array.length){

        j++;

        if(array[j] === '('){
            brackets++;
        } else if (array[j] === ')'){
            brackets--;
        }

    }

    return array.slice(0, j + 1);

}

/**
 * Tokenise an input string
 * @param {} text the string to tokenise
 */
function tokenise(text){

    const len = text.length;
    var tokens = [];

    var string = "";
    var brackets = 0;

    var abstraction = false;

    var parseError = false;
    var parseNumber = 0;
    var errorMessage = "";

    for(i = 0; i < len; i++){

        const currentCharacter = text.charAt(i);

        switch(currentCharacter){

            // a dot can only follow an abstraction
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
                }
                break;

            // a space can only indicate a gap between terms, and cannot occur inside strings
            case ' ':
                if(abstraction){
                    parseError = true;
                    errorMessage = "Variable expected after lambda abstraction";
                } else {
                    tokens = pushString(tokens, string);
                    string = "";
                }
                break;

            // a closing bracket must have a matching opening bracket
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

            // beginning of an abstraction;
            case '\\':
                abstraction = true;
                tokens = pushString(tokens, string);
                string = "";
                tokens = pushString(tokens, currentCharacter);
                break;

            // start of a subterm, need to check there is a matching closing bracket
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

            // any other character is part of a string
            default:
                string += currentCharacter;
                break;
        }

        if(parseError){
            return "Parse error, character " + i + ": " + errorMessage;
        }

    }

    // push whatever is left at the end
    if(string !== ""){
        tokens = pushString(tokens, string);
    }

    return tokens;

}

function pushString(array, string){
    
    if(string !== ""){
        array = smartPush(array, string);
    }

    return array;
}

function smartPush(array, item){

    if(array[0] === ""){
        array[0] = item;
    } else {
        array.push(item);
    }

    return array;

}

/**
 * Find the index of the appropriate closing bracket - i.e. the end of the term
 * @param {*} initial the initial index of the term in the whole string
 * @param {*} text the text to search for the closing bracket
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