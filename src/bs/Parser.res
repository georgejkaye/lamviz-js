open Lambda
open Helpers

exception ParseError(string)

type token = EOF | LAMBDA | LBRACKET | RBRACKET | DOT | ID(string) | GARBAGE

let token_type = token => {
  switch token {
  | EOF => 0
  | LAMBDA => 1
  | LBRACKET => 2
  | RBRACKET => 3
  | DOT => 4
  | ID(_) => 5
  | GARBAGE => 6
  }
}

let token_cmp = (token1, token2) => token_type(token1) == token_type(token2)

let next_char = (s, i) => i < String.length(s) ? Some(String.get(s, i)) : None

let letters = %re("/[a-zA-Z0-9]/")

let rec lexer' = (term, i, seen) => {
  let x = next_char(term, i)
  switch x {
  | None => seen != "" ? list{ID(seen), EOF} : list{EOF}
  | Some(c) =>
    Js.Re.test_(letters, Char.escaped(c))
      ? lexer'(term, i + 1, seen ++ Char.escaped(c))
      : seen != ""
      ? {
        list{ID(seen), ...lexer'(term, i, "")}
      }
      : {
          let t = switch c {
          | '\\' => LAMBDA
          | '(' => LBRACKET
          | ')' => RBRACKET
          | '.' => DOT
          | _ => GARBAGE
          }
          t == GARBAGE ? lexer'(term, i + 1, "") : list{t, ...lexer'(term, i + 1, "")}
        }
  }
}

let lexer = term => lexer'(term, 0, "")

/* Check if the next token has a given type */
let next = (token, tokens) => {
  switch tokens {
  | list{} => false
  | list{t, ..._} => token_cmp(t, token)
  }
}

let value = token => {
  switch token {
  | ID(x) => x
  | _ => failwith("Missing variable name.")
  }
}

let token = (token, tokens) => {
  next(token, tokens) ? (List.hd(tokens), List.tl(tokens)) : (GARBAGE, tokens)
}

/* Assert the next token has a given type, then skip it */
let match = (token, tokens) => {
  next(token, tokens) ? List.tl(tokens) : raise(ParseError("Unexpected token encountered."))
}

/* Skip the next token if it has a given type */
let skip = (token, tokens) => {
  next(token, tokens) ? (true, List.tl(tokens)) : (false, tokens)
}

let rec term = (ctx, tokens, macros) => {
  let (b, tokens) = skip(LAMBDA, tokens)

  if b {
    let (id, tokens) = token(ID(""), tokens)
    let tokens = match(DOT, tokens)
    let (term, tokens) = term(list{value(id), ...ctx}, tokens, macros)
    (Abs(term, value(id), ""), tokens)
  } else {
    application(ctx, tokens, macros)
  }
}

and application = (ctx, tokens, macros) => {
  let (lhs, tokens) = atom(ctx, tokens, macros)

  let lhs = switch lhs {
  | None => raise(ParseError("Unexpected character encountered."))
  | Some(t) => t
  }

  application'(lhs, ctx, tokens, macros)
}
and application' = (lhs, ctx, tokens, macros) => {
  let (rhs, tokens) = atom(ctx, tokens, macros)

  switch rhs {
  | None => (lhs, tokens)
  | Some(t) =>
    let lhs = App(lhs, t, "")
    application'(lhs, ctx, tokens, macros)
  }
}

and atom = (ctx, tokens, macros) => {
  let (b1, tokens) = skip(LBRACKET, tokens)
  let b2 = next(ID(""), tokens)

  if b1 {
    let (term, tokens) = term(ctx, tokens, macros)
    let tokens = match(RBRACKET, tokens)
    (Some(term), tokens)
  } else if b2 {
    let (id, tokens) = token(ID(""), tokens)
    switch index(value(id), ctx) {
    | x => (Some(Var(x, "")), tokens)
    | exception Not_found => switch lookupMacro(macros, value(id)) {
      | t => (Some(t), tokens)
      | exception Not_found => raise(ParseError("Unexpected variable encountered."))
      }
    }
  } else {
    (None, tokens)
  }
}

let parse = (tokens, context, macros, macro) => {
  let (result, tokens) = term(context, tokens, macros)
  let _ = match(EOF, tokens)
  macro == "" ? result : rename(result, macro)
}

let lexAndParse = (term, context, macros, macro) => {
  let lexed = lexer(term)
  let context = context == "" ? list{} : split(context, ' ')
  let parsed = parse(lexed, context, Array.to_list(macros), macro)
  (parsed, context)
}
