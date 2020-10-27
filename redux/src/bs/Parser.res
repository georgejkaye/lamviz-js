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
