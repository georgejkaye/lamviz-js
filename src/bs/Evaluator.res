open Lambda

exception Timeout

/**
 * Shifts all the de Bruijn indices in a term by a certain amount.
 * @param {lambdaTerm} t - The lambda term to do the shifting to.
 * @param {int}        d - The number of places to shift by.
 * @param {int}        c - The cutoff point, below which numbers will not be shifted by.
 * @return {lambdaterm}  - The newly shifted lambda term.
 */
let rec shift = (t, d) => shift'(t, d, 0)
and shift' = (t, d, c) => {
  switch t {
  | Var(x, a) => x < c ? t : Var(x + d, a)
  | Abs(t, x, a) => Abs(shift'(t, d, c + 1), x, a)
  | App(t1, t2, a) => App(shift'(t1, d, c), shift'(t2, d, c), a)
  }
}

/**
 * Substitute a term for a variable in a term - i.e. t [j -> s] .
 * @param {lambdaTerm} t - The term the substitution is to be performed in.
 * @param {int}        j - The index of the variable to substitute.
 * @param {lambdaTerm} s - The term to substitute in.
 * @return {Object}      - The newly substituted lambda term.
 */
let rec substitute = (t, j, s) => {
  switch t {
  | Var(x, a) => x == j ? s : t
  | Abs(t, x, a) => {
      let t' = substitute(t, j + 1, shift(s, 1))
      equal(t, t') ? Abs(t, x, a) : Abs(t', x, "")
    }
  | App(t1, t2, a) => {
      let t1' = substitute(t1, j, s)
      let t2' = substitute(t2, j, s)
      equal(t1, t1') && equal(t2, t2') ? App(t1, t2, a) : App(t1', t2', "")
    }
  }
}

//let substituteVariable = (j, t) => substitute(j, Var(s, ""), t)

/**
 * Perform a beta-reduction.
 * @param {lambdaTerm}  abs - The abstraction to substitute the value in.
 * @param {lambdaTerm}  val - The value to substitute into the abstraction.
 * @return {lambdaTerm}     - The beta-reduced expression.
 */
let performBetaReduction = (t, u) => {
  switch t {
  | Abs(t, _, _) => shift(substitute(t, 0, shift(u, 1)), -1)
  | _ => failwith("This is not a beta redex")
  }
}

let maxReductions = 500
let timeout = curr => curr > maxReductions

let rec evaluate = t => fst(evaluate'(t, 1))
and evaluate' = (t, n) => {
  timeout(n)
    ? raise(Timeout)
    : {
        switch t {
        | Var(_, _) => (t, n)
        | Abs(_, _, _) => (t, n)
        | App(t1, t2, a) =>
          isBetaRedex(t)
            ? (performBetaReduction(t1, t2), n)
            : switch t1 {
              | Abs(_, _, _) => {
                  let (t2', n) = evaluate'(t2, n + 1)
                  t2 == t2' ? (App(t1, t2, a), n) : evaluate'(App(t1, t2', ""), n + 1)
                }
              | _ => {
                  let (t1', n) = evaluate'(t1, n + 1)
                  t1 == t1' ? (App(t1, t2, a), n) : evaluate'(App(t1', t2, ""), n + 1)
                }
              }
        }
      }
}

let rec normalise = t => fst(normalise'(t, 0))
and normalise' = (t, n) => {
  let n = n + 1
  betaRedexes(t) == 0
    ? (t, n)
    : timeout(n)
    ? raise(Timeout)
    : {
        switch t {
        | Var(_, _) => (t, n)
        | Abs(t, x, a) =>
          let (t', n) = normalise'(t, n)
          equal(t, t') ? (Abs(t, x, a), n) : (Abs(t', x, ""), n)
        | App(t1, t2, a) =>
          isBetaRedex(t)
            ? {
                Js.log("beta redex " ++ prettyPrintDeBruijn(t))
                normalise'(performBetaReduction(t1, t2), n)
              }
            : {
                let (t1', n) = normalise'(t1, n + 1)
                let (t2', n) = normalise'(t2, n + 1)
                equal(t1, t1') && equal(t2, t2')
                  ? (App(t1, t2, a), n)
                  : normalise'(App(t1', t2', ""), n)
              }
        }
      }
}

let rec outermostReduction = term => {
  !hasBetaRedex(term)
    ? term
    : switch term {
      | Var(_, _) => failwith("This should never ever happen")
      | Abs(t, x, _) => Abs(outermostReduction(t), x, "")
      | App(t1, t2, _) =>
        isBetaRedex(term)
          ? performBetaReduction(t1, t2)
          : hasBetaRedex(t1)
          ? App(outermostReduction(t1), t2, "")
          : App(t1, outermostReduction(t2), "")
      }
}

let rec innermostLeftmostReduction = term => {
  !hasBetaRedex(term)
    ? term
    : switch term {
      | Var(_, _) => failwith("This should never ever happen")
      | Abs(t, x, _) => Abs(innermostLeftmostReduction(t), x, "")
      | App(t1, t2, _) =>
        hasBetaRedex(t1)
          ? App(innermostLeftmostReduction(t1), t2, "")
          : hasBetaRedex(t2)
          ? App(t1, innermostLeftmostReduction(t2), "")
          : performBetaReduction(t1, t2)
      }
}

let rec innermostRightmostReduction = term => {
  !hasBetaRedex(term)
    ? term
    : switch term {
      | Var(_, _) => failwith("This should never ever happen")
      | Abs(t, x, _) => Abs(innermostLeftmostReduction(t), x, "")
      | App(t1, t2, _) =>
        hasBetaRedex(t2)
          ? App(t1, innermostLeftmostReduction(t2), "")
          : hasBetaRedex(t1)
          ? App(innermostLeftmostReduction(t1), t2, "")
          : performBetaReduction(t1, t2)
      }
}

let rec specificReduction = (term, i) => fst(specificReduction'(term, i))
and specificReduction' = (term, i) => {
  !hasBetaRedexInside(term)
    ? (term, i)
    : switch term {
      | Var(_, _) => (term, i)
      | Abs(t, x, _) => {
          let (scopeReduction, i) = specificReduction'(t, i)
          i == -1 ? (Abs(scopeReduction, x, ""), i) : (term, i)
        }
      | App(t1, t2, _) =>
        isBetaRedex(term) && i == 0
          ? {
              (performBetaReduction(t1, t2), -1)
            }
          : hasBetaRedex(t1)
          ? {
            let (lhsReduction, i) = specificReduction'(t1, i)
            i == -1 ? (App(lhsReduction, t2, ""), i) : (term, i)
          }
          : {
              let (rhsReduction, i) = specificReduction'(t2, i)
              i == -1 ? (App(t1, rhsReduction, ""), i) : (term, i)
            }
      }
}
