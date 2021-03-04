open Lambda
open Helpers
open Evaluator

let genVarName = i => ("b" ++ str(i + 1), i + 1)

// A dict entry for n,k is a list of tuples mapping lists of variables to lists of lambda terms
type variablesEntry = {"vars": list<int>, "terms": list<lambdaTerm>}
type dictionaryField = list<variablesEntry>

// the memory is an n x k array of dict entries, which may or may not exist
type memory = array<array<option<dictionaryField>>>

// Fill an n x k memory with Nones
let initialiseMemory: (int, int) => memory = (n, k) => Array.init(n, _ => Array.init(k, _ => None))

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
 * @param n    the size of the term
 * @param ks   the list of indices of the free variables
 * @param mem  the memory object
 */
let rec generateTerms = (n, ks, mem) => generateTerms'(n, ks, mem, 0)
/* * Helper for generateTerms
 * @param n     the size of the term
 * @param ks    the list of indices of the free variables
 * @param mem   the memory object
 * @param next  the next index to assign to a variable
 */
and generateTerms' = (n, ks, mem, next) => {
  // First check if we already have the entry in the memory
  n < Array.length(mem) && List.length(ks) < Array.length(mem[n])
    ? switch mem[n][List.length(ks)] {
      | None => generateTerms''(n, ks, mem, next)
      | Some(field) =>
        // Does the field contain our selection of variables?
        switch lookupTerms(field, ks) {
        | exception Not_found => {
            // Get a new entry populated with our variables
            let newTerms = replaceVariables(List.hd(field), ks)
            // Add it to the memory
            mem[n][List.length(ks)] = Some(list{{"vars": ks, "terms": newTerms}, ...field})
            (newTerms, mem, next)
          }
        | entry => (entry["terms"], mem, next)
        }
      }
    : generateTerms''(n, ks, mem, next)
}
/* * Helper for generateTerms'
 * @param n     the size of the term
 * @param ks    the list of indices of the free variables
 * @param mem   the memory object
 * @param next  the next index to assign to a variable
 * @return (terms, memory, next)
 */
and generateTerms'' = (n, ks, mem, next) => {
  let (terms, mem, next) = switch n {
  | 0 => (list{}, mem, next)
  | 1 => (List.map(i => Var(i, ""), ks), mem, next)
  | n => {
      // Generate terms of one less subterm and one more free variable
      let (absTerms, mem, next) = generateTerms'(
        n - 1,
        list{0, ...List.map(x => x + 1, ks)},
        mem,
        next,
      )
      // Wrap these terms in abstractions
      let (absTerms, next) = List.fold_left(((acc, next), t) => {
        (list{Abs(t, fst(genVarName(next)), ""), ...acc}, next + 1)
      }, (list{}, next), absTerms)
      let absTerms = List.rev(absTerms)

      // Generate all subterms of one less subterm and all variables
      let (appTerms, mem, next) = n > 2 ? List.fold_left(((acc, mem, next), m) => {
              let (appTerms, mem, next) = generateAppTerms(m, n, ks, mem, next)
              (List.append(acc, appTerms), mem, next)
            }, (list{}, mem, next), range(1, n - 2)) : (list{}, mem, next)

      (List.append(absTerms, appTerms), mem, next)
    }
  }

  let newEntry = {"vars": ks, "terms": terms}

  n < Array.length(mem) && List.length(ks) < Array.length(mem[n])
    ? {
        let newField = switch mem[n][List.length(ks)] {
        | None => list{newEntry}
        | Some(entry) => list{newEntry, ...entry}
        }
        mem[n][List.length(ks)] = Some(newField)
      }
    : ()

  (terms, mem, next)
}
and generateAppTerms = (m, n, ks, mem, next) => {
  let (lhsTerms, mem, next) = generateTerms'(m, ks, mem, next)
  let (rhsTerms, mem, next) = generateTerms'(n - 1 - m, ks, mem, next)
  let appTerms = List.fold_left((acc, lhs) => {
    List.append(
      acc,
      List.rev(List.fold_left((acc, rhs) => list{App(lhs, rhs, ""), ...acc}, list{}, rhsTerms)),
    )
  }, list{}, lhsTerms)
  (appTerms, mem, next)
}

let generateTermsArray = (n, k, mem) => {
  let (terms, _, mem) = generateTerms(n, k, mem)
  (Array.of_list(terms), mem)
}
