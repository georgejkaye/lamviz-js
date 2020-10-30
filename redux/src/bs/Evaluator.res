open Lambda

exception Timeout

let rec shift = (t, d, c) => {
  switch t {
  | Var(x, a) => x < c ? t : Var(x + d, a)
  | Abs(t, x, a) => Abs(shift(t, d, c + 1), x, a)
  | App(t1, t2, a) => App(shift(t1, d, c), shift(t2, d, c), a)
  }
}

let rec substitute = (s, j, t) => {
  switch t {
  | Var(x, _) => x == j ? s : t
  | Abs(t, x, a) =>
    let t' = substitute(shift(s, 1, 0), j + 1, t)
    t == t ? Abs(t, x, a) : Abs(t', x, "")
  | App(t1, t2, a) =>
    let t1' = substitute(s, j, t1)
    let t2' = substitute(s, j, t2)
    t1 == t1' && t2 == t2' ? App(t1, t2, a) : App(t1', t2', "")
  }
}

let substituteVariable = (s, j, t) => substitute(Var(s, ""), j, t)

let performBetaReduction = (t, u) => {
  switch t {
  | Abs(t, _, _) => shift(substitute(shift(u, 1, 0), 0, t), -1, 0)
  | _ => failwith("This is not a beta redex")
  }
}

let maxReductions = 100

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
