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

let rec index' = (a, xs, n) => {
  switch xs {
  | list{} => raise(ParseError("Parse error: Unexpected variable encountered"))
  | list{x, ...xs} => x == a ? n : index'(a, xs, n + 1)
  }
}

let index = (a, xs) => index'(a, xs, 0)

let token_cmp = (token1, token2) => token_type(token1) == token_type(token2)

let next_char = (s, i) => i < String.length(s) ? Some(String.get(s, i)) : None

let letters = %re("/[a-z]/")

let rec lexer' = (term, i, seen) => {
  let x = next_char(term, i)
  switch x {
  | None => seen != "" ? list{ID(seen), EOF} : list{EOF}
  | Some(c) =>
    Js.Re.test_(letters, Char.escaped(c))
      ? lexer'(term, i + 1, seen ++ Char.escaped(c))
      : seen != ""
      ? {
        Js.log(seen)
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
  | _ => failwith("token has no value")
  }
}

let token = (token, tokens) => {
  next(token, tokens) ? (List.hd(tokens), List.tl(tokens)) : (GARBAGE, tokens)
}

/* Assert the next token has a given type, then skip it */
let match = (token, tokens) => {
  next(token, tokens) ? List.tl(tokens) : raise(ParseError("Unexpected token encountered"))
}

/* Skip the next token if it has a given type */
let skip = (token, tokens) => {
  next(token, tokens) ? (true, List.tl(tokens)) : (false, tokens)
}

let rec term = (ctx, tokens) => {
  let (b, tokens) = skip(LAMBDA, tokens)

  if b {
    let (id, tokens) = token(ID(""), tokens)
    let tokens = match(DOT, tokens)
    let (term, tokens) = term(list{value(id), ...ctx}, tokens)
    (Abs(term, value(id), ""), tokens)
  } else {
    application(ctx, tokens)
  }
}

and application = (ctx, tokens) => {
  let (lhs, tokens) = atom(ctx, tokens)

  let lhs = switch lhs {
  | None => raise(ParseError("Unexpected character encountered!"))
  | Some(t) => t
  }

  application'(lhs, ctx, tokens)
}
and application' = (lhs, ctx, tokens) => {
  let (rhs, tokens) = atom(ctx, tokens)

  switch rhs {
  | None => (lhs, tokens)
  | Some(t) =>
    let lhs = App(lhs, t, "")
    application'(lhs, ctx, tokens)
  }
}

and atom = (ctx, tokens) => {
  let (b1, tokens) = skip(LBRACKET, tokens)
  let b2 = next(ID(""), tokens)

  if b1 {
    let (term, tokens) = term(ctx, tokens)
    let tokens = match(RBRACKET, tokens)
    (Some(term), tokens)
  } else if b2 {
    let (id, tokens) = token(ID(""), tokens)
    (Some(Var(index(value(id), ctx), "")), tokens)
  } else {
    (None, tokens)
  }
}

let parse = (context, tokens) => {
  let (result, tokens) = term(context, tokens)
  let _ = match(EOF, tokens)
  result
}

let lex_and_parse = (term, context) => {
  let lexed = lexer(term)
  let context = split(context, ' ')
  let parsed = parse(context, lexed)
  Js.log(prettyPrint(parsed))
  parsed
}
