# Parser unit tests

## Valid terms
These terms should be accepted by the parser and display the appropriate de Bruijn notation of the term.

LHS: user input
RHS: correct de Bruijn notation (`\` = lambda)

### Basic
* ``\x. x`` = `\ 0`

### Multiple variables
* `\x.\y. x y` = `\ \ 1 0`
* `\x.\y. y x` = `\ \ 0 1`
* `\x.\y. x` = `\ \ 1`
* `\x.\y. y` = `\ \ 0`
* `\x. x \y. y` = `\ 0 \ 0`
* `\x. x \y. x` = `\ 0 \ 1`
* `\x.\y.\z. x y z` = `\ \ \ 2 1 0`

### Repeated variables
* `\x. x x` = `\ \ 0 0`
* `\x. x (\x. x)` = `\ 0 (\ 0)`
* `\x. (\x. x) x` = `\ (\ 0) 0`

### Bracketing
* `\x. (x)` = `\ 0`
* `(\x. x)` = `\ 0`
* `(\x. x)(\y. y)` = `(\ 0) (\ 0)`
* `\x.\y.\z. x (y z)` = `\ \ \ 2 (1 0)`
* `\x.\y.\z. (x y) z` = `\ \ \ (2 1) 0`

### Subterms
* `\x. (\y. y) x` = `\ (\ 0) 0`
* `\x.\y. x (\x. x) y` = `\ \ 1 (\ 0) 1`
* `\x.\y. (\x.\y. x y) x y` = `\ \ (\ \ 1 0) 1 0`
* `\x.\y. (\x.\y. x y) (x y)` = `\ \ (\ \ 1 0) (1 0)`

### Variables >1 character
* `\var. var` = `\ 0`
* `\x.\var. x var` = `\ \ 1 0`
* `\x.\var. var x` = `\ \ 0 1`
* `\var. var var` = `\ 0 0`

### Free variables (with context = [a, b])
* `a b` = `1 0`
* `a` = `1`
* `b` = `0`
* `\x. a x` = `\ 2 0`
* `\x. x a` = `\ 0 2`
* `\x. b x` = `\ 1 0`
* `\x. x b` = `\ 0 1`
* `\x. a b` = `\ 2 1`
* `\x. b a` = `\ 1 2`
* `\x. x b a` = `\ 0 1 2`
* `\x. a b x` = `\ 2 1 0`

### Some random big long terms 
* `\x.\y. x x x y x \y.\z. (\w. w y z x) y z (\a.\b. b a x)` = `\ \ 1 1 1 0 1 (\ \ (\ 0 2 1 4) 1 0 (\ \ 0 1 5))`
* `\x.\y.\z.\a.\b.\c.\d.x y z a b c c b a z (\x. x d) y x` = `\ \ \ \ \ \ \ 6 5 4 3 2 1 1 2 3 4 (\ 0 1) 5 6` 

## Invalid terms
These terms should be rejected by the parser and display an error message.

### Lone brackets
* `(`
* `)`

### Missing abstraction variable
* `\.`
* `\`
* `.`
* `\x`

### Missing abstraction body
* `\x.`
* `\x. x (\y.)`
* `\x. x \y.`

### Undefined variable
* `x`
* `\x. y`
* `\x. x y`
* `\x. y x`

### Malformed terms
* `\x. (x`
* `\x. x)`
* `(\x. x`
* `\x. x (`
* `\x. x ()`
* `\x. x )`