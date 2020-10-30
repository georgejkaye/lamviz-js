/**
 * File containing definitions of the lambda terms
 */

open Helpers

/**
 * Context type
 * Stores a list of variables on a stack with their
 *    - term labels
 *    - graph labels
 */

type context = list<string>

let variableNames = list{"x", "y", "z", "w", "u", "v", "t", "p", "q", "r", "s", "m", "n", "o"}
let varNameNo = List.length(variableNames)
let freeVariableNames = list{"a", "b", "c", "d", "e"}
let freeNameNo = List.length(freeVariableNames)

let getVariableName = n => {
  let i = mod(n, varNameNo)
  let p = n / varNameNo
  List.nth(variableNames, i) ++ String.make(p, '\'')
}

let getFreeVariableName = n => {
  let i = mod(n, freeNameNo)
  let p = n / freeNameNo
  List.nth(freeVariableNames, i) ++ String.make(p, '\'')
}

let length = ctx => List.length(ctx)
let pushTerm = (ctx, x) => list{x, ...ctx}
let popTerm = ctx => {
  switch ctx {
  | list{} => list{}
  | list{_, ...ctx} => ctx
  }
}
let lookup = (ctx, i) => List.nth(ctx, i)
let present = (ctx, x) => {
  switch index(ctx, x) {
  | exception Not_found => false
  | _ => true
  }
}
let rec refreshFreeVariableNames = ctx => refreshFreeVariableNames'(ctx, 0)
and refreshFreeVariableNames' = (ctx, n) => {
  switch ctx {
  | list{} => list{}
  | list{_, ...ctx} => list{getFreeVariableName(n), ...refreshFreeVariableNames'(ctx, n + 1)}
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
 * Pretty print a lambda term with De Bruijn indices
 * @param t a lambda term
 * @return a pretty printed term with de bruijn indices
 */

let rec prettyPrintDeBruijn = t => prettyPrintDeBruijn'(t, 0)
and prettyPrintDeBruijn' = (t, x) => {
  switch t {
  | Var(i, _) => string(i)
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

/**
 * Pretty print a lambda term
 * @param t a lambda term
 * @param ctx a lambda context
 * @return a pretty printed term
 */

let rec prettyPrint = (t, ctx) => prettyPrint'(t, ctx, 0)
and prettyPrint' = (t, ctx, x) => {
  switch t {
  | Var(i, "") => lookup(ctx, i)
  | Var(_, a) => a
  | Abs(t, y, "") => {
      let ctx' = pushTerm(ctx, y)
      let string = `λ${y}. ${prettyPrint'(t, ctx', 0)}`
      x == 0 ? string : "(" ++ string ++ ")"
    }
  | Abs(_, _, a) => a
  | App(t1, t2, "") =>
    x == 0
      ? switch t1 {
        | Abs(_, _, _) => "(" ++ prettyPrint'(t1, ctx, 0) ++ ") " ++ prettyPrint'(t2, ctx, 1)
        | _ => prettyPrint'(t1, ctx, 0) ++ " " ++ prettyPrint'(t2, ctx, 1)
        }
      : "(" ++ prettyPrint'(t1, ctx, x) ++ " " ++ prettyPrint'(t2, ctx, x) ++ ")"
  | App(_, _, a) => a
  }
}

let rec subterms = t => {
  switch t {
  | Var(_, _) => 1
  | Abs(t, _, _) => 1 + subterms(t)
  | App(t1, t2, _) => 1 + subterms(t1) + subterms(t2)
  }
}

let rec appearances = (t, i) => {
  switch t {
  | Var(x, _) => x == i ? 1 : 0
  | Abs(t, _, _) => appearances(t, i + 1)
  | App(t1, t2, _) => appearances(t1, i) + appearances(t2, i)
  }
}

let rec freeVariables = t => {
  switch t {
  | Var(_, _) => 1
  | Abs(t, _, _) => freeVariables(t) - appearances(t, 0)
  | App(t1, t2, _) => freeVariables(t1) + freeVariables(t2)
  }
}

let rec freeVariableIndices = t => {
  switch t {
  | Var(x, _) => list{x}
  | Abs(t, _, _) => List.map(x => x - 1, List.filter(x => x != 0, freeVariableIndices(t)))
  | App(t1, t2, _) => List.concat(list{freeVariableIndices(t1), freeVariableIndices(t2)})
  }
}

let closed = t => freeVariables(t) == 0

let rec crossings = t => {
  switch t {
  | Var(_, _) => 0
  | Abs(t, _, _) => crossings(t)
  | App(t1, t2, _) => {
      let freeVarsLHS = freeVariableIndices(t1)
      let freeVarsRHS = freeVariableIndices(t2)

      let crossings = crossings(t1) + crossings(t2)
      crossings + crossings'(freeVarsLHS, freeVarsRHS)
    }
  }
}
and crossings' = (lhs, rhs) => {
  switch lhs {
  | list{} => 0
  | list{x, ...xs} => crossings''(x, rhs) + crossings'(xs, rhs)
  }
}
and crossings'' = (i, rhs) => {
  switch rhs {
  | list{} => 0
  | list{x, ...xs} => i < x ? 1 + crossings''(i, xs) : crossings''(i, xs)
  }
}

let rec bridges = t => {
  switch t {
  | Var(_, _) => 0
  | Abs(t, _, _) => closed(t) ? 1 + bridges(t) : bridges(t)
  | App(t1, t2, _) =>
    let t1b = closed(t1) ? 1 + bridges(t1) : bridges(t1)
    let t2b = closed(t2) ? 1 + bridges(t2) : bridges(t2)
    t1b + t2b
  }
}

let bridgeless = t => bridges(t) == 0

let rec variables = t => {
  switch t {
  | Var(_, _) => 1
  | Abs(t, _, _) => variables(t)
  | App(t1, t2, _) => variables(t1) + variables(t2)
  }
}

let rec abstractions = t => {
  switch t {
  | Var(_, _) => 0
  | Abs(t, _, _) => 1 + abstractions(t)
  | App(t1, t2, _) => abstractions(t1) + abstractions(t2)
  }
}

let rec applications = t => {
  switch t {
  | Var(_, _) => 0
  | Abs(t, _, _) => applications(t)
  | App(t1, t2, _) => 1 + applications(t1) + applications(t2)
  }
}

let rec uniqueVariables = t => fst(uniqueVariables'(t, list{}))
and uniqueVariables' = (t, seen) => {
  switch t {
  | Var(x, _) => contains(x, seen) ? (0, seen) : (1, list{x, ...seen})
  | Abs(t, _, _) => {
      let (vs, seen) = uniqueVariables'(t, List.map(x => x + 1, seen))
      (vs, List.map(x => x - 1, seen))
    }
  | App(t1, t2, _) => {
      let (lhs, seen) = uniqueVariables'(t1, seen)
      let (rhs, seen) = uniqueVariables'(t2, seen)
      (lhs + rhs, seen)
    }
  }
}

let isBetaRedex = t => {
  switch t {
  | Var(_, _) => false
  | Abs(_, _, _) => false
  | App(t1, _, _) =>
    switch t1 {
    | Abs(_, _, _) => true
    | _ => false
    }
  }
}

let rec hasBetaRedex = t => {
  switch t {
  | Var(_, _) => false
  | Abs(t, _, _) => hasBetaRedex(t)
  | App(t1, t2, _) => isBetaRedex(t) || hasBetaRedex(t1) || hasBetaRedex(t2)
  }
}

let hasBetaRedexInside = t => {
  switch t {
  | Var(_, _) => false
  | Abs(t, _, _) => hasBetaRedex(t)
  | App(t1, t2, _) => hasBetaRedex(t1) || hasBetaRedex(t2)
  }
}

let rec betaRedexes = t => {
  switch t {
  | Var(_, _) => 0
  | Abs(t, _, _) => betaRedexes(t)
  | App(t1, t2, _) =>
    let n = isBetaRedex(t) ? 1 : 0
    n + betaRedexes(t1) + betaRedexes(t2)
  }
}

let linear = t => uniqueVariables(t) == variables(t)
let planar = t => linear(t) && crossings(t) == 0

let rec printRedexes = (t, ctx) => {
  switch t {
  | Var(_, _) => list{}
  | Abs(t, x, _) => printRedexes(t, list{x, ...ctx})
  | App(t1, t2, _) =>
    let redexes = List.concat(list{printRedexes(t1, ctx), printRedexes(t2, ctx)})
    isBetaRedex(t) ? list{prettyPrint(t, ctx), ...redexes} : redexes
  }
}

let printRedexesArray = (t, ctx) => Array.of_list(printRedexes(t, ctx))

let rec printHTML = (t, db, ctx) => {
  let (string, _, _, _, _) = printHTML'(t, db, ctx, 0, 0, 0, 0, 0)
  string
}
and printHTML' = (t, db, ctx, x, vars, abs, apps, betas) => {
  switch t {
  | Var(n, a) => {
      let label = db ? string(n) : a != "" ? a : lookup(ctx, n)
      let string = "<span class = \"var-" ++ string(vars) ++ "\">" ++ label ++ "</span>"
      (string, vars + 1, abs, apps, betas)
    }
  | Abs(t, l, a) => {
      let (scope, vars, abs, apps, betas) = printHTML'(
        t,
        db,
        list{l, ...ctx},
        0,
        vars,
        abs + 1,
        apps,
        betas,
      )

      let label =
        a != ""
          ? a
          : {
              let b1 = x == 0 ? "" : "("
              let b2 = x == 0 ? "" : ")"
              let n = db ? " " : l ++ ". "
              b1 ++ "&lambda;" ++ n ++ scope ++ b2
            }

      let string = "<span class = \"abs-" ++ string(abs) ++ "\">" ++ label ++ "</span>"
      (string, vars, abs + 1, apps, betas)
    }
  | App(t1, t2, a) => {
      let bt1 = isBetaRedex(t) ? "id = \"beta-" ++ string(betas) ++ "\" " : ""
      let bt2 = isBetaRedex(t) ? " beta-" ++ string(betas) : ""
      let btn = bt1 == "" ? 0 : 1

      let (label, vars, abs, apps, betas) =
        a != ""
          ? (a, vars, abs, apps, betas)
          : {
              let (y, z) =
                x == 0
                  ? switch t1 {
                    | Abs(_, _, _) => (1, 1)
                    | _ => (0, 1)
                    }
                  : (x, x + 1)

              let (lhs, vars, abs, apps, betas) = printHTML'(
                t1,
                db,
                ctx,
                y,
                vars,
                abs,
                apps + 1,
                betas + btn,
              )
              let (rhs, vars, abs, apps, betas) = printHTML'(t2, db, ctx, z, vars, abs, apps, betas)
              let b1 = x == 0 ? "" : "("
              let b2 = x == 0 ? "" : ")"
              (b1 ++ lhs ++ " " ++ rhs ++ b2, vars, abs, apps, betas)
            }

      let string =
        "<span " ++ bt1 ++ "class= \"app-" ++ string(apps) ++ bt2 ++ "\">" ++ label ++ "</span>"
      (string, vars, abs, apps, betas)
    }
  }
}

let rec refreshVariableNames = (t, ctx) => (
  fst(refreshVariableNames'(t, 0)),
  refreshFreeVariableNames(ctx),
)
and refreshVariableNames' = (t, n) => {
  switch t {
  | Var(_, _) => (t, n)
  | Abs(t, _, "") => {
      let (t, n') = refreshVariableNames'(t, n + 1)
      (Abs(t, getVariableName(n), ""), n')
    }
  | Abs(_, _, _) => (t, n)
  | App(t1, t2, "") => {
      let (lhs, n') = refreshVariableNames'(t1, n)
      let (rhs, n'') = refreshVariableNames'(t2, n')
      (App(lhs, rhs, ""), n'')
    }
  | App(_, _, _) => (t, n)
  }
}
