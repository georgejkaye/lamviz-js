open Lambda

exception Timeout

let rec shift = (t, d) => shift'(t, d, 0)
and shift' = (t, d, c) => {
  switch t {
  | Var(x, a) => x < c ? t : Var(x + d, a)
  | Abs(t, x, a) => Abs(shift'(t, d, c + 1), x, a)
  | App(t1, t2, a) => App(shift'(t1, d, c), shift'(t2, d, c), a)
  }
}

let rec substitute = (j, s, t) => substitute'(j, s, t, 0)
and substitute' = (j, s, t, c) => {
  switch t {
  | Var(x, a) => x == j + c ? shift(s, c) : t
  | Abs(t, x, a) =>
    let t' = substitute'(j, s, t, c + 1)
    t == t ? Abs(t, x, a) : Abs(t', x, "")
  | App(t1, t2, a) =>
    let t1' = substitute'(j, s, t1, c)
    let t2' = substitute'(j, s, t2, c)
    t1 == t1' && t2 == t2' ? App(t1, t2, a) : App(t1', t2', "")
  }
}

//let substituteVariable = (j, t) => substitute(j, Var(s, ""), t)

let performBetaReduction = (t, u) => {
  switch t {
  | Abs(t, _, _) => shift(substitute(0, shift(u, 1), t), -1)
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

let rec normalise = t => fst(normalise'(t, 1))
and normalise' = (t, n) => {
  timeout(n)
    ? raise(Timeout)
    : {
        switch t {
        | Var(_, _) => (t, n)
        | Abs(t, x, a) => {
            let (t', n) = normalise'(t, n + 1)
            t == t' ? (Abs(t, x, a), n) : (Abs(t', x, ""), n)
          }
        | App(t1, t2, a) =>
          isBetaRedex(t)
            ? normalise'(performBetaReduction(t1, t2), n + 1)
            : {
                let (t1', n) = normalise'(t1, n + 1)
                let (t2', n) = normalise'(t2, n + 1)
                t1 == t1' && t2 == t2'
                  ? (App(t1, t2, a), n)
                  : {
                      switch t1 {
                      | Abs(_, _, _) => normalise'(App(t1', t2', ""), n + 1)
                      | _ => (App(t1', t2', ""), n)
                      }
                    }
              }
        }
      }
}
