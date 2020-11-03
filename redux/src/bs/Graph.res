open Lambda
open Helpers

let lambda = `λ`

type pos = {"x": int, "y": int}

type nodedata = {"id": string, "label": string, "position": pos}

type node = {"data": nodedata, "classes": array<string>}

type edgedata = {"id": string, "source": string, "target": string, "label": string}

type nodeType =
  ABS | ABS_MP | ABS_SP_MP | ABS_SP | ABS_TOP | APP | APP_MP | VAR | VAR_MP | VAR_TOP | FREE | ROOT

let nid = (ntype, n) => {
  let prefix = switch ntype {
  | ABS => "abs"
  | APP => "app"
  | APP_MP => "app_mp"
  | ABS_SP => "abs_sp"
  | ABS_MP => "abs_mp"
  | ABS_SP_MP => "abs_sp_mp"
  | ABS_TOP => "abs_top"
  | VAR => "var"
  | VAR_MP => "var_mp"
  | VAR_TOP => "var_top"
  | FREE => "free"
  | ROOT => ">"
  }
  prefix ++ "_" ++ str(n)
}

let eid = (n1type, n1, n2type, n2) => {
  let (n1, n2) = (nid(n1type, n1), nid(n2type, n2))
  n1 ++ "_to_" ++ n2
}

type direction = U | L | R

type edge = {"data": edgedata, "classes": array<string>}

let rec checkNodeId = (nodes, id) =>
  contains(id, List.map(x => x["data"]["id"], nodes)) ? checkNodeId(nodes, id ++ "'") : id

let createNode = (nodes, id, classes, x, y, label) =>
  {
    "data": {"id": checkNodeId(nodes, id), "label": label, "position": {"x": x, "y": y}},
    "classes": classes,
  }

let rec checkEdgeId = (edges, id) =>
  contains(id, List.map(x => x["data"]["id"], edges)) ? checkEdgeId(edges, id ++ "'") : id

let createEdge = (edges, id, classes, source, target, label) =>
  {
    "data": {"id": checkEdgeId(edges, id), "source": source, "target": target, "label": label},
    "classes": classes,
  }

let furthestLeft = nodes => {
  switch nodes {
  | list{} => failwith("empty")
  | list{n, ...ns} =>
    List.fold_left(
      (n, x) => x["data"]["position"]["x"] < n ? x["data"]["position"]["x"] : n,
      n["data"]["position"]["x"],
      ns,
    )
  }
}

let furthestRight = nodes => {
  switch nodes {
  | list{} => failwith("empty")
  | list{n, ...ns} =>
    List.fold_left(
      (n, x) => x["data"]["position"]["x"] > n ? x["data"]["position"]["x"] : n,
      n["data"]["position"]["x"],
      ns,
    )
  }
}

let shiftNodeX = (nodes, x) =>
  List.map(
    n =>
      createNode(
        list{},
        n["data"]["id"],
        n["classes"],
        n["data"]["position"]["x"] + x,
        n["data"]["position"]["y"],
        n["data"]["label"],
      ),
    nodes,
  )

let rec generateFreeVariableElements = (ctx, dict) =>
  generateFreeVariableElements'(ctx, dict, list{}, 0)
and generateFreeVariableElements' = (ctx, dict, nodes, n) => {
  switch ctx {
  | list{} => (list{}, dict, n)
  | list{x, ...xs} => {
      let nodeID = "free" ++ str(n)
      let nodeLabel = lambda ++ x
      let node = createNode(nodes, nodeID, ["free"], 0, 0, nodeLabel)

      let dict = list{(n, false), ...dict}
      generateFreeVariableElements'(xs, dict, list{node, ...nodes}, n + 1)
    }
  }
}

let nodeDistanceX = 5
let nodeDistanceY = 5

let rec generateGraphElements = (term, ctx) => {
  let (nodes, dict, n) = generateFreeVariableElements(ctx, list{})

  let root = createNode(nodes, ">", ["root"], 0, 0, "")

  let (nodes', edges, _, _, _) = generateGraphElements'(
    term,
    ctx,
    dict,
    list{root, ...nodes},
    list{},
    root,
    0,
    ROOT,
    U,
    list{},
    false,
    0,
    n,
    0,
  )

  Js.log("Done!")
  (list{root, ...List.concat(list{nodes', nodes})}, edges)
}
and generateGraphElements' = (
  term,
  ctx,
  dict,
  nodes,
  edges,
  parent,
  pn,
  ptype,
  dir,
  redexes,
  redexEdge,
  vars,
  abs,
  apps,
) => {
  Js.log("Processing " ++ prettyPrint(term, ctx))

  let posY = parent["data"]["position"]["y"] - nodeDistanceY
  let mpPosY = parent["data"]["position"]["y"] - nodeDistanceY / 2

  let (posX, mpPosX) = switch dir {
  | U => (parent["data"]["position"]["x"], parent["data"]["position"]["x"])
  | L => (
      parent["data"]["position"]["x"] - nodeDistanceX,
      parent["data"]["position"]["x"] - nodeDistanceX / 2,
    )
  | R => (
      parent["data"]["position"]["x"] + nodeDistanceX,
      parent["data"]["position"]["x"] + nodeDistanceX / 2,
    )
  }

  switch term {
  | Var(x, a) => {
      let x = fst(List.nth(dict, x))

      let node1 = createNode(nodes, nid(VAR_MP, vars), ["midpoint"], mpPosX, mpPosY, "")
      let node2 = createNode(nodes, nid(VAR, vars), ["support"], posX, posY, "")
      let node3 = createNode(nodes, nid(VAR_TOP, vars), ["top"], posX, posY - nodeDistanceY, "")

      let edge1 = createEdge(
        edges,
        eid(ptype, pn, VAR_MP, vars),
        ["varedge"],
        parent["data"]["id"],
        node1["data"]["id"],
        "",
      )

      let edge2 = createEdge(
        edges,
        eid(VAR_MP, vars, VAR, vars),
        ["varedge"],
        node1["data"]["id"],
        node2["data"]["id"],
        "",
      )
      let edge3 = createEdge(
        edges,
        eid(VAR, vars, VAR_TOP, vars),
        ["varedge"],
        node2["data"]["id"],
        node3["data"]["id"],
        "",
      )
      let edge4 = createEdge(
        edges,
        eid(VAR_TOP, vars, ABS_TOP, x),
        ["arc"],
        node3["data"]["id"],
        nid(ABS_TOP, x),
        "",
      )

      (list{node1, node2, node3}, list{edge1, edge2, edge3, edge4}, vars + 1, abs, apps)
    }
  | Abs(t, x, a) => {
      let node1 = createNode(nodes, nid(ABS_MP, abs), ["midpoint"], mpPosX, mpPosY, "")
      let node2 = createNode(nodes, nid(ABS, abs), ["abstraction"], posX, posY, lambda)
      let node3 = createNode(
        nodes,
        nid(ABS_SP_MP, abs),
        ["midpoint"],
        posX + nodeDistanceX / 2,
        posY - nodeDistanceY / 2,
        "",
      )
      let node4 = createNode(
        nodes,
        nid(ABS_SP, abs),
        ["support"],
        posX + nodeDistanceX,
        posY - nodeDistanceY,
        "",
      )
      let node5 = createNode(
        nodes,
        nid(ABS_TOP, abs),
        ["top"],
        posX + nodeDistanceX,
        posY - 2 * nodeDistanceY,
        "",
      )

      let edge1 = createEdge(
        edges,
        eid(ptype, pn, ABS_MP, abs),
        ["absedge"],
        parent["data"]["id"],
        node1["data"]["id"],
        "",
      )
      let edge2 = createEdge(
        edges,
        eid(ABS_MP, abs, ABS, abs),
        ["absedge"],
        node1["data"]["id"],
        node2["data"]["id"],
        "",
      )
      let edge3 = createEdge(
        edges,
        eid(ABS, abs, ABS_SP_MP, abs),
        ["varedge"],
        node2["data"]["id"],
        node3["data"]["id"],
        "",
      )
      let edge4 = createEdge(
        edges,
        eid(ABS_SP_MP, abs, ABS_SP, abs),
        ["varedge"],
        node3["data"]["id"],
        node4["data"]["id"],
        "",
      )
      let edge5 = createEdge(
        edges,
        eid(ABS_SP, abs, ABS_TOP, abs),
        ["varedge"],
        node4["data"]["id"],
        node5["data"]["id"],
        "",
      )

      let nnodes = list{node1, node2, node3, node4, node5}
      let nedges = list{edge1, edge2, edge3, edge4, edge5}

      let nodes = List.concat(list{nnodes, nodes})
      let edges = List.concat(list{nedges, edges})
      let (snodes, sedges, vars', abs', apps') = generateGraphElements'(
        t,
        list{x, ...ctx},
        list{(abs, false), ...dict},
        nodes,
        edges,
        node2,
        abs,
        ABS,
        L,
        redexes,
        redexEdge,
        vars,
        abs + 1,
        apps,
      )

      let srightmost = furthestRight(snodes)
      let snodes =
        srightmost >= posX ? shiftNodeX(snodes, -(srightmost - posX) - nodeDistanceX) : snodes

      (List.concat(list{snodes, nnodes}), List.concat(list{sedges, nedges}), vars', abs', apps')
    }
  | App(t1, t2, a) => {
      let node1 = createNode(nodes, nid(APP_MP, apps), ["midpoint"], mpPosX, mpPosY, "")
      let node2 = createNode(nodes, nid(APP, apps), ["application"], posX, posY, "@")

      let edge1 = createEdge(
        edges,
        eid(ptype, pn, APP_MP, apps),
        ["appedge"],
        parent["data"]["id"],
        node1["data"]["id"],
        "",
      )
      let edge2 = createEdge(
        edges,
        eid(APP_MP, apps, APP, apps),
        ["appedge"],
        node1["data"]["id"],
        node2["data"]["id"],
        "",
      )

      let (lnodes, ledges, vars', abs', apps') = generateGraphElements'(
        t1,
        ctx,
        dict,
        list{node1, node2, ...nodes},
        list{edge1, edge2, ...edges},
        node2,
        apps,
        APP,
        L,
        redexes,
        redexEdge,
        vars,
        abs,
        apps + 1,
      )
      let (rnodes, redges, vars'', abs'', apps'') = generateGraphElements'(
        t2,
        ctx,
        dict,
        nodes,
        edges,
        node2,
        apps,
        APP,
        R,
        redexes,
        redexEdge,
        vars',
        abs',
        apps',
      )

      let lrightmost = furthestRight(lnodes)
      let lnodes =
        lrightmost >= posX ? shiftNodeX(lnodes, -(lrightmost - posX) - nodeDistanceX) : lnodes

      let rleftmost = furthestLeft(rnodes)
      let rnodes = rleftmost <= posX ? shiftNodeX(rnodes, posX - rleftmost + nodeDistanceX) : rnodes

      (
        List.concat(list{lnodes, rnodes, list{node1, node2}}),
        List.concat(list{ledges, redges, list{edge1, edge2}}),
        vars'',
        abs'',
        apps'',
      )
    }
  }
}

let generateGraphElementsArray = (term, ctx) => {
  let (nodes, edges) = generateGraphElements(term, ctx)
  (Array.of_list(nodes), Array.of_list(edges))
}