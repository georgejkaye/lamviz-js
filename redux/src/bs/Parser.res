open Lambda

type token = EOF | LAMBDA | LBRACKET | RBRACKET | DOT | ID(string) | GARBAGE

let next_char = (s, i) => i < String.length(s) ? Some(String.get(s, i)) : None

let letters = %re("/[a-z]/")

let rec lexer' = (term, i, seen) => {
  Js.log(term)
  let x = next_char(term, i)

  switch x {
  | None => list{EOF}
  | Some(c) =>
    Js.Re.test_(letters, Char.escaped(c))
      ? lexer'(term, i + 1, seen ++ Char.escaped(c))
      : seen != ""
      ? list{ID(seen), ...lexer'(term, i, "")}
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

let next = (token, tokens) => {
  switch tokens {
  | list{} => false
  | list{t, ...ts} => t == token
  }
}

let match = (token, tokens) => {
  next(token, tokens) ? List.tl(tokens) : failwith("error!")
}

let skip = (token, tokens) => {
  next(token, tokens) ? (true, List.tl(tokens)) : (false, tokens)
  }
}

let rec term = (tokens, ctx) => {
  switch tokens {
  | list{LAMBDA, ...ts} => failwith("todo")
  | ts => application(tokens, ctx)
  }
}
and application = (tokens, ctx) => failwith("todo")
and atom = (tokens, ctx) => failwith("todo")
