open Lambda
open Helpers
open Evaluator

let genVarName = i => ("b" ++ str(i + 1), i + 1)

type memory = array<array<option<list<(list<string>, list<lambdaTerm>)>>>>

let initialiseMemory: (int, int) => memory = (~n=16, ~k=16) =>
  Array.init(n, x => Array.init(k, y => None))

let rec generateTerms = (n, k, i, mem) => generateTerms'(n, k, mem)
and generateTerms' = (n, k, mem) => {
  switch mem[n][List.length(k)] {
  | Some(_) => lookupTerms(n, k, mem)
  | None => generateTerms''(n, k, i, mem)
  }
}
and lookupTerms = (n, k, mem) => {
  let field = mem[n][List.length(k)]
  switch List.find(x => lists_equal(fst(x), k), field) {
  | x => (snd(x), mem)
  | exception Not_found => addNewFreeVariables(n, k, field, mem)
  }
}
and addNewFreeVariables = (n, k, field, mem) => {
  let (vars, terms) = field
  let rec newTerms = switch terms {
  | list{} => list{}
  | list{t, ...ts} => list{
      List.fold_left2((acc, x, y) => substituteVariable(acc, x, y), t, vars, k),
      ...newTerms(ts),
    }
  }

  mem[n][k] := list{newTerms, ...mem[n][k]}
  (newTerms, mem)
}
and generateTerms'' = (n, k, i, mem) => {
  let terms = switch n {
  | 0 => list{}
  | 1 => List.mapi((i, _) => Var(i, ""), k)
  | n => {
      let (absScopes, i) = generateTerms'(n - 1, list{0, ...List.map(x => x + 1, k)}, i, mem)
      let absTerms = List.mapi((t, j) => Abs(t, genVarName(i + j)), absScopes)
      let i = i + List.length(absTerms)
    }
  }
}
