open Lambda
open Helpers
open Evaluator

type fragment = Pure | Linear | Planar

let toFragment = n => {
  switch n {
  | 0 => Pure
  | 1 => Linear
  | 2 => Planar
  | _ => failwith("toFragment: bad number")
  }
}

let genVarName = i => ("b" ++ str(i + 1), i + 1)

// A dict entry for n,k is a list of tuples mapping lists of variables to lists of lambda terms
type variablesEntry = {"vars": list<int>, "terms": list<lambdaTerm>}
type dictionaryField = list<variablesEntry>

// the memory is an n x k array of dict entries, which may or may not exist
type memory = array<array<option<dictionaryField>>>
type termBank = {"pure": memory, "linear": memory, "planar": memory}

// Fill an n x k memory with Nones
let initialiseMemory: (int, int) => memory = (n, k) => Array.init(n, _ => Array.init(k, _ => None))

let initialiseTermBank = (n, k) =>
  {
    "pure": initialiseMemory(n, k),
    "linear": initialiseMemory(n, k),
    "planar": initialiseMemory(n, k),
  }

let getFragmentBank = (tb, frag) => {
  switch frag {
  | Pure => tb["pure"]
  | Linear => tb["linear"]
  | Planar => tb["planar"]
  }
}

// generate a context with k free variables
let rec generateContext = k => List.rev(generateContext'(k))
and generateContext' = k => {
  switch k {
  | 0 => list{}
  | n => list{n - 1, ...generateContext'(n - 1)}
  }
}

/**
 * Look up the terms for a given list of free variables in a field
 * @param field the field in question
 * @param ks    the list of free variables
 * @return either the corresponding list or Not_found if this particular combination doesn't exist
 */
let lookupTerms = (field, ks) => List.find(x => lists_equal(x["vars"], ks), field)

/**
 * Replace all the variables in an entry with different ones
 * @param entry the entry in question
 * @param ks    the free variables to substitute in
 */
let rec replaceVariables = (entry, ks) => {
  replaceVariables'(entry["terms"], entry["vars"], ks, list{})
}
/**
 * For a list of terms, replace their variables with different ones
 * @param terms   a list of terms
 * @param vars    a list of free variables in the terms
 * @param ks      a list of variables to replace in the terms
 * @param acc     the accumulator of terms
 * @return the new list of terms
 */
and replaceVariables' = (terms, vars, ks, acc) => {
  switch terms {
  | list{} => List.rev(acc)
  | list{t, ...ts} =>
    let replaced = List.fold_left2((acc, x, y) => substituteVariable(acc, x, y), t, vars, ks)
    replaceVariables'(ts, vars, ks, list{replaced, ...acc})
  }
}

/**
 * Generate terms for given n and a list of free variables
 * @param n     the size of the term
 * @param ks    the list of indices of the free variables
 * @param frag  the fragment to generate terms for
 * @param tb   the memory object
 */
let rec generateTerms = (n, ks, frag, tb) =>
  generateTerms'(n, ks, frag, getFragmentBank(tb, frag), 0)
/* * Helper for generateTerms
 * @param n     the size of the term
 * @param ks    the list of indices of the free variables
 * @param frag  the fragment to generate terms for
 * @param tb    the term bank
 * @param next  the next index to assign to a variable
 */
and generateTerms' = (n, ks, frag, tb, next) => {
  // First check if we already have the entry in the memory
  n < Array.length(tb) && List.length(ks) < Array.length(tb[n])
    ? switch tb[n][List.length(ks)] {
      | None => generateTerms''(n, ks, frag, tb, next)
      | Some(field) =>
        // Does the field contain our selection of variables?
        switch lookupTerms(field, ks) {
        | exception Not_found => {
            // Get a new entry populated with our variables
            let newTerms = replaceVariables(List.hd(field), ks)
            // Add it to the memory
            tb[n][List.length(ks)] = Some(list{{"vars": ks, "terms": newTerms}, ...field})
            (newTerms, tb, next)
          }
        | entry => (entry["terms"], tb, next)
        }
      }
    : generateTerms''(n, ks, frag, tb, next)
}
/* * Helper for generateTerms'
 * @param n     the size of the term
 * @param ks    the list of indices of the free variables
 * @param frag  the fragment to generate for
 * @param tb    the term bank
 * @param next  the next index to assign to a variable
 * @return (terms, memory, next)
 */
and generateTerms'' = (n, ks, frag, tb, next) => {
  let (terms, tb, next) = switch n {
  | 0 => (list{}, tb, next)
  | 1 =>
    switch frag {
    | Pure => (List.map(i => Var(i, ""), ks), tb, next)
    | Linear => failwith("todo")
    | Planar =>
      let term = List.length(ks) == 1 ? list{Var(List.hd(ks), "")} : list{}
      (term, tb, next)
    }
  | n => {
      // Generate terms of one less subterm and one more free variable
      let (absTerms, tb, next) = generateTerms'(
        n - 1,
        list{0, ...List.map(x => x + 1, ks)},
        frag,
        tb,
        next,
      )
      // Wrap these terms in abstractions
      let (absTerms, next) = List.fold_left(((acc, next), t) => {
        (list{Abs(t, fst(genVarName(next)), ""), ...acc}, next + 1)
      }, (list{}, next), absTerms)
      let absTerms = List.rev(absTerms)

      // Generate applications based on how many subterms are in the lhs and the rhs
      // m = number of subterms in lhs
      let (appTerms, tb, next) = n > 2 ? List.fold_left(((acc, tb, next), m) => {
              let (appTerms, tb, next) = switch frag {
              | Pure => generatePureAppTerms(m, n, ks, tb, next)
              | Linear => failwith("todo")
              | Planar => generatePlanarAppTerms(m, n, ks, tb, next)
              }
              (List.append(acc, appTerms), tb, next)
            }, (list{}, tb, next), range(1, n - 2)) : (list{}, tb, next)

      (List.append(absTerms, appTerms), tb, next)
    }
  }

  let newEntry = {"vars": ks, "terms": terms}

  n < Array.length(tb) && List.length(ks) < Array.length(tb[n])
    ? {
        let newField = switch tb[n][List.length(ks)] {
        | None => list{newEntry}
        | Some(entry) => list{newEntry, ...entry}
        }
        tb[n][List.length(ks)] = Some(newField)
      }
    : ()

  (terms, tb, next)
}
and generatePureAppTerms = (m, n, ks, tb, next) => {
  let (lhsTerms, tb, next) = generateTerms'(m, ks, Pure, tb, next)
  let (rhsTerms, tb, next) = generateTerms'(n - 1 - m, ks, Pure, tb, next)
  let appTerms = List.fold_left((acc, lhs) => {
    List.append(
      acc,
      List.rev(List.fold_left((acc, rhs) => list{App(lhs, rhs, ""), ...acc}, list{}, rhsTerms)),
    )
  }, list{}, lhsTerms)
  (appTerms, tb, next)
}
and generatePlanarAppTerms = (m, n, ks, tb, next) => {
  Js.log("Planar!")
  let (appTerms, tb, next) = List.fold_left(((acc, tb, next), i) => {
    let (rhsVars, lhsVars) = splitList(List.length(ks) - i, ks)
    let (lhsTerms, tb, next) = generateTerms'(m, lhsVars, Planar, tb, next)
    let (rhsTerms, tb, next) = generateTerms'(n - 1 - m, rhsVars, Planar, tb, next)
    let appTerms = List.fold_left((acc, lhs) => {
      List.append(
        acc,
        List.rev(List.fold_left((acc, rhs) => list{App(lhs, rhs, ""), ...acc}, list{}, rhsTerms)),
      )
    }, list{}, lhsTerms)
    (List.append(acc, appTerms), tb, next)
  }, (list{}, tb, next), range(0, List.length(ks)))
  (appTerms, tb, next)
}

let generateTermsArray = (n, k, frag, tb) => {
  let (terms, _, tb) = generateTerms(n, k, toFragment(frag), tb)
  (Array.of_list(terms), tb)
}
