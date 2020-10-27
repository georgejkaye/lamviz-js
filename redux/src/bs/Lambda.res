/**
 * File containing definitions of the lambda terms
 */

/**
 * Context type
 * Stores a list of variables on a stack with their
 *    - term labels
 *    - graph labels
 */

type context = list<string>

let length = ctx => List.length(ctx)
let pushTerm = (x, ctx) => list{x, ...ctx}
let popTerm = ctx => {
  switch ctx {
  | list{} => list{}
  | list{_, ...ctx} => ctx
  }
}
let lookup = (ctx, i) => List.nth(i, ctx)

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
let rec prettyPrintDeBruijn' = (t, x) => {
  switch t {
  | Var(i, _) => string_of_int(i)
  | Abs(t, _, _) =>
    x == 0 ? `λ ${prettyPrintDeBruijn'(t, 0)}` : `(λ ${prettyPrintDeBruijn'(t, 0)})`
  | App(t1, t2, _) =>
    x == 0
      ? switch t1 {
        | Abs(_, _, _) => prettyPrintDeBruijn'(t1, 1) ++ " " ++ prettyPrintDeBruijn'(t2, 1)
        | _ => prettyPrintDeBruijn'(t1, 0) ++ " " ++ prettyPrintDeBruijn'(t2, 1)
        }
      : "(" ++ prettyPrintDeBruijn'(t1, x) ++ " " ++ prettyPrintDeBruijn'(t2, x + 1) ++ ")"
  }
}

let prettyPrintDeBruijn = t => prettyPrintDeBruijn'(t, 0)

let rec prettyPrint' = (t, ctx, x) => {
  switch t {
  | Var(i, "") => lookup(i, ctx)
  | Var(i, a) => a
  | Abs(t, y, "") => {
      let ctx' = pushTerm(y, ctx)
      let string = `λ${y}. ${prettyPrint'(t, ctx', 0)}`
      x == 0 ? string : "(" ++ string ++ ")"
    }
  | Abs(t, x, a) => a
  | App(t1, t2, "") =>
    x == 0
      ? switch t1 {
        | Abs(_, _, _) => "(" ++ prettyPrint'(t1, ctx, 0) ++ ") " ++ prettyPrint'(t2, ctx, 1)
        | _ => prettyPrint'(t1, ctx, 0) ++ " " ++ prettyPrint'(t2, ctx, 1)
        }
      : "(" ++ prettyPrint'(t1, ctx, x) ++ " " ++ prettyPrint'(t2, ctx, x)
  | App(t1, t2, a) => a
  }
}

let prettyPrint = (t, ctx) => prettyPrint'(t, ctx, 0)
