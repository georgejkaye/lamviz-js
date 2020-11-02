open Lambda
open Helpers

let lambda = `λ`

type nodedata = {
  id: string,
  label: string,
}

type pos = {
  x: int,
  y: int,
}

type node = {
  data: nodedata,
  classes: array<string>,
  pos: pos,
}

type edgedata = {
  id: string,
  source: string,
  target: string,
  label: string,
}

type nodeType = ABS | APP | ABS_SUP | ABS_TOP | VAR | VAR_TOP | FREE

let nid = (ntype, n) => {
  let prefix = switch ntype {
  | ABS => "abs"
  | APP => "app"
  | ABS_SUP => "abs_sup"
  | ABS_TOP => "abs_top"
  | VAR => "var"
  | VAR_TOP => "var_top"
  | FREE => "free"
  }
  prefix ++ "_" ++ str(n)
}

let eid = (n1type, n2type, n) => {
  let (n1, n2) = (nid(n1type, n), nid(n2type, n))
  n1 ++ "_to_" ++ n2 ++ "_" ++ str(n)
}

type direction = U | L | R

type edge = {data: edgedata, classes: array<string>}

let createNode = (id, classes, x, y, label) => {
  data: {id: id, label: label},
  classes: classes,
  pos: {x: x, y: y},
}

let createEdge = (id, classes, source, target, label) => {
  data: {id: id, source: source, target: target, label: label},
  classes: classes,
}

let rec generateFreeVariableElements = (ctx, dict) =>
  generateFreeVariableElements'(ctx, dict, list{}, 0)
and generateFreeVariableElements' = (ctx, dict, elems, n) => {
  switch ctx {
  | list{} => (list{}, dict, n)
  | list{x, ...xs} => {
      let nodeID = "free_" ++ str(n)
      let nodeLabel = lambda ++ x
      let node = createNode(nodeID, ["free"], 0, 0, nodeLabel)

      let dict = list{n, ...dict}
      generateFreeVariableElements'(ctx, dict, list{node, ...elems}, n + 1)
    }
  }
}

let nodeDistanceX = 30
let nodeDistanceY = 30

let rec generateMapElements = (term, ctx) => {
  let (elems, dict, n) = generateFreeVariableElements(ctx, list{})

  generateMapElements'(
    term,
    ctx,
    elems,
    dict,
    {data: {id: ">", label: ""}, classes: ["root"], pos: {x: 0, y: 0}},
    U,
    list{},
    false,
    n,
  )
}
and generateMapElements' = (term, ctx, dict, elems, parent, dir, redexes, redexEdge, n) => {
  let posY = parent.pos.y - nodeDistanceY

  let posX = switch dir {
  | U => parent.pos.x
  | L => parent.pos.x - nodeDistanceX
  | R => parent.pos.x - nodeDistanceY
  }

  switch term {
  | Var(x, a) => {
      let nodeID = List.nth(dict, x)
      let varNode = createNode(nid(VAR, x), ["var"], posX, posY, "")
      let varTopNode = createNode(nid(VAR_TOP, x), ["var_top"], posX, posY - nodeDistanceY)
      let varToVarTopEdge = createEdge(
        eid(VAR, VAR_TOP, x),
        ["var_to_var_top"],
        nid(VAR, x),
        nid(VAR_TOP, x),
      )
    }
  }
}
