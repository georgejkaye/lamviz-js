let rec split = (s, c) => {
  Js.log(s)
  switch String.index(s, c) {
  | exception Not_found => list{s}
  | n =>
    let m1 = String.sub(s, 0, n)
    switch String.sub(s, n + 1, String.length(s) - n - 1) {
    | exception Invalid_argument(_) => list{m1}
    | m2 => m1 == "" ? split(m2, c) : list{m1, ...split(m2, c)}
    }
  }
}

let rec print_list' = (xs, f) => {
  switch xs {
  | list{} => ", "
  | list{x, ...xs} => f(x) ++ "," ++ print_list'(xs, f)
  }
}

let print_list = (xs, f) => {
  let printed = print_list'(xs, f)
  "[" ++ String.sub(printed, 0, String.length(printed) - 3) ++ "]"
}
