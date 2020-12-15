open Lambda
open Helpers
open Evaluator

let genVarName = i => ("b" ++ str(i + 1), i + 1)

type memory = array<array<option<list<(list<string>, list<lambdaTerm>)>>>>

let initialiseMemory: (int, int) => memory = (n, k) => Array.init(n, _ => Array.init(k, _ => None))
let rec generateContext = k => {
  switch k {
  | 0 => list{0}
  | n => list{n, ...generateContext(n - 1)}
  }
}

let rec generateTerms = (n, k, mem) => generateTerms'(n, k, 0, mem)
and generateTerms' = (n, k, i, mem) => {
  n < Array.length(mem)
    ? switch mem[n][List.length(k)] {
      | Some(f) => lookupTerms(n, k, f, i, mem)
      | None => generateTerms''(n, k, i, mem)
      }
    : generateTerms''(n, k, i, mem)
}
and lookupTerms = (n, k, field, i, mem) => {
  switch List.find(x => lists_equal(fst(x), k), field) {
  | x => (snd(x), i, mem)
  | exception Not_found => addNewFreeVariables(n, k, field, i, mem)
  }
}
and addNewFreeVariables = (n, k, field, i, mem) => {
  let (vars, terms) = List.hd(field)

  let rec newTerms = terms => {
    switch terms {
    | list{} => list{}
    | list{t, ...ts} => list{
        List.fold_left2((acc, x, y) => substituteVariable(acc, x, y), t, vars, k),
        ...newTerms(ts),
      }
    }
  }

  let workingTerms = newTerms(terms)
  mem[n][List.length(k)] = Some(list{(vars, workingTerms), ...field})
  (workingTerms, i, mem)
}
and generateTerms'' = (n, k, i, mem) => {
  let (terms, i, mem) = switch n {
  | 0 => (list{}, i, mem)
  | 1 => (List.mapi((i, _) => Var(i, ""), k), i + List.length(k), mem)
  | n => {
      let (absScopes, i, mem) = generateTerms'(n - 1, list{0, ...List.map(x => x + 1, k)}, i, mem)
      let absTerms = List.mapi((j, t) => Abs(t, fst(genVarName(i + j)), ""), absScopes)
      let i = i + List.length(absTerms)

      let rec genAppTerms = (m, i) => {
        let (lhsTerms, i, mem) = generateTerms'(m, k, i, mem)
        let (rhsTerms, i, mem) = generateTerms'(n - 1 - m, k, i, mem)

        let appTerms = List.concat(
          List.fold_left(
            (acc, t) => list{
              List.fold_left((bcc, u) => list{App(t, u, ""), ...bcc}, list{}, rhsTerms),
              ...acc,
            },
            list{},
            lhsTerms,
          ),
        )

        switch m {
        | 0 => failwith("appTerms: never call with 0")
        | 1 => (appTerms, i, mem)
        | m => {
            let (newTerms, i, mem) = genAppTerms(m - 1, i)
            (List.concat(list{appTerms, newTerms}), i, mem)
          }
        }
      }

      let (appTerms, i, mem) = genAppTerms(n - 2, i)
      (List.concat(list{absTerms, appTerms}), i, mem)
    }
  }

  mem[n][List.length(k)] = Some(list{(k, terms)})
  (terms, i, mem)
}

let rec generateTermsArray = (n, k, mem) => {
  let (terms, _, mem) = generateTerms(n, k, mem)
  (Array.of_list(terms), mem)
}
