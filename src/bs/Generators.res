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
  switch mem[n][List.length(ks)] {
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
}
/* * Helper for generateTerms'
 * @param n     the size of the term
 * @param ks    the list of indices of the free variables
 * @param mem   the memory object
 * @param next  the next index to assign to a variable
 * @return (terms, memory, next)
 */
and generateTerms'' = (n, ks, mem, next) => {
  let terms = switch n {
  | 0 => list{}
  | 1 => List.map(i => Var(i, ""), ks)
  | n => failwith("todo")
  }

  let newEntry = {"vars": ks, "terms": terms}

  let newField = switch mem[n][List.length(ks)] {
  | None => Some(list{newEntry})
  | Some(entry) => Some(list{newEntry, ...entry})
  }

  mem[n][List.length(ks)] = newField
  (terms, mem, next)
}

let rec generateTermsArray = (n, k, mem) => {
  let (terms, _, mem) = generateTerms(n, k, mem)
  (Array.of_list(terms), mem)
}
