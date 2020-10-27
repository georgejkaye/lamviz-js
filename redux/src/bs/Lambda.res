/**
 * File containing definitions of the lambda terms
 */

/**
 * Context type
 * Stores a list of variables on a stack with their
 *    - term labels
 *    - graph labels
 */

type context = list<(string, string)>

let length = ctx => List.length(ctx)
let pushTerm = (x, g, ctx) => list{(x, g), ...ctx}
let popTerm = ctx => {
  switch ctx {
  | list{} => list{}
  | list{x, ...ctx} => ctx
  }
}

/**
 * Lambda term type
 * Can be a
 *  - Variable : index * alias
 *  - Abstraction : subterm * initial label * alias
 *  - Application : left * right * alias
 */
type rec lambdaTerm =
  | Var(int, string)
  | Abs(lambdaTerm, string, string)
  | App(lambdaTerm, lambdaTerm, string)

let newVar = (i, alias) => Var(i, alias)
let newAbs = (t, x, alias) => Abs(t, x, alias)
let newApp = (t1, t2, alias) => App(t1, t2, alias)

/**
 * Pretty print a lambda term
 * @param t a lambda term
 * @param x the level of the term we are at (for bracketing)
 * @return a pretty printed term
 */
let rec prettyPrint = (t, x) => {
  switch t {
  | Var(i, _) => string_of_int(i)
  | Abs(t, _, _) => x == 0 ? `λ ${prettyPrint(t, 0)}` : `(λ ${prettyPrint(t, 0)})`
  | App(t1, t2, _) =>
    x == 0
      ? switch t1 {
        | Abs(_, _, _) => prettyPrint(t1, 1) ++ " " ++ prettyPrint(t2, 1)
        | _ => prettyPrint(t1, 0) ++ " " ++ prettyPrint(t2, 1)
        }
      : "(" ++ prettyPrint(t1, x) ++ " " ++ prettyPrint(t2, x + 1) ++ ")"
  }
}
