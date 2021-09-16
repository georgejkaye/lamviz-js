open Lambda
open Helpers

let lambda = `λ`

type pos = {"x": int, "y": int}
type nodedata = {"id": string, "label": string, "position": pos}
type node = {"data": nodedata, "position": pos, "classes": array<string>}
type edgedata = {"id": string, "source": string, "target": string, "label": string}
type midpoint = {"source": string, "midpoint": string, "target": string}

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
  | ROOT => "root"
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
    "position": {"x": x, "y": y},
    "classes": classes,
  }

let createNodeList = (nodes, id, classes, x, y, label) =>
  createNode(nodes, id, Array.of_list(classes), x, y, label)

let rec checkEdgeId = (edges, id) =>
  contains(id, List.map(x => x["data"]["id"], edges)) ? checkEdgeId(edges, id ++ "'") : id

let createEdge = (edges, id, classes, source, target, label) =>
  {
    "data": {"id": checkEdgeId(edges, id), "source": source, "target": target, "label": label},
    "classes": classes,
  }

let createEdgeList = (edges, id, classes, source, target, label) =>
  createEdge(edges, id, Array.of_list(classes), source, target, label)

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
  generateFreeVariableElements'(ctx, dict, list{}, list{}, list{}, 0)
and generateFreeVariableElements' = (ctx, dict, nodes, edges, frees, n) => {
  switch ctx {
  | list{} => (nodes, edges, dict, frees, n)
  | list{x, ...xs} => {
      let node1 = createNode(nodes, nid(ABS, n), ["abstraction", "free"], 0, 0, lambda)
      let node2 = createNode(nodes, nid(ABS_SP, n), ["support", "free"], 0, 0, "")
      let node3 = createNode(nodes, nid(ABS_TOP, n), ["top", "free"], 0, 0, "")
      let edge1 = createEdge(
        edges,
        eid(ABS, n, ABS_SP, n),
        ["abs-edge", "free"],
        node1["data"]["id"],
        node2["data"]["id"],
        x,
      )
      let edge2 = createEdge(
        edges,
        eid(ABS_SP, n, ABS_TOP, n),
        ["abs-edge", "free"],
        node2["data"]["id"],
        node3["data"]["id"],
        "",
      )

      let dict = list{(n, false), ...dict}
      generateFreeVariableElements'(
        xs,
        dict,
        list{node1, node2, node3, ...nodes},
        list{edge1, edge2, ...edges},
        list{(node1["data"]["id"], node2["data"]["id"], node3["data"]["id"]), ...frees},
        n + 1,
      )
    }
  }
}

let nodeDistanceX = 5
let nodeDistanceY = 5

type stats = {vars: int, apps: int, abs: int, betas: int}
type parent = {node: node, id: int, nodeType: nodeType}

type graphdata = {
  term: lambdaTerm, // The term being translated
  ctx: context, // The current context
  dict: list<(int, bool)>, // Lookup table for variables
  nodes: list<node>, // Current list of nodes
  edges: list<edge>, // Current list of edges
  parent: parent, // Parent of current node
  dir: direction, // Direction of this node relative to parent
  stats: stats, // The count of lambda elements so far
  betaClasses: list<string>, // The list of beta redexes the current term is part of
}
type graphret = {
  nodes: list<node>,
  edges: list<edge>,
  midpoints: list<midpoint>,
  stats: stats,
}

let rec generateGraphElements = (term, ctx) => {
  let (nodes, edges, dict, frees, n) = generateFreeVariableElements(ctx, list{})

  let root = createNode(nodes, "root", ["root"], 0, 0, "")

  let ret = generateGraphElements'({
    term: term,
    ctx: ctx,
    dict: dict,
    nodes: list{root, ...nodes},
    edges: edges,
    parent: {node: root, id: 0, nodeType: ROOT},
    dir: U,
    stats: {vars: n, apps: 0, abs: 0, betas: 0},
    betaClasses: list{},
  })

  (
    list{root, ...List.concat(list{ret.nodes, nodes})},
    List.concat(list{ret.edges, edges}),
    frees,
    ret.midpoints,
  )
}
and generateGraphElements' = data => {
  let posY = data.parent.node["data"]["position"]["y"] - nodeDistanceY
  let mpPosY = data.parent.node["data"]["position"]["y"] - nodeDistanceY / 2

  let (posX, mpPosX) = switch data.dir {
  | U => (data.parent.node["data"]["position"]["x"], data.parent.node["data"]["position"]["x"])
  | L => (
      data.parent.node["data"]["position"]["x"] - nodeDistanceX,
      data.parent.node["data"]["position"]["x"] - nodeDistanceX / 2,
    )
  | R => (
      data.parent.node["data"]["position"]["x"] + nodeDistanceX,
      data.parent.node["data"]["position"]["x"] + nodeDistanceX / 2,
    )
  }

  switch data.term {
  | Var(x, _) => {
      let (i, _) = List.nth(data.dict, x)

      let labelclass = switch data.dir {
      | U => "term-edge"
      | L => "var-edge-l"
      | R => "var-edge-r"
      }

      let id = data.stats.vars

      let node1 = createNodeList(
        data.nodes,
        nid(VAR_MP, id),
        list{"midpoint", labelclass, ...data.betaClasses},
        mpPosX,
        mpPosY,
        lookup(data.ctx, x),
      )
      let node2 = createNodeList(
        data.nodes,
        nid(VAR, id),
        list{"support", ...data.betaClasses},
        posX,
        posY,
        "",
      )
      let node3 = createNodeList(
        data.nodes,
        nid(VAR_TOP, id),
        list{"top", ...data.betaClasses},
        posX,
        posY - nodeDistanceY,
        "",
      )

      let edge1 = createEdgeList(
        data.edges,
        eid(data.parent.nodeType, data.parent.id, VAR_MP, id),
        list{"varedge", ...data.betaClasses},
        data.parent.node["data"]["id"],
        node1["data"]["id"],
        "",
      )

      let edge2 = createEdgeList(
        data.edges,
        eid(VAR_MP, id, VAR, id),
        list{"varedge", ...data.betaClasses},
        node1["data"]["id"],
        node2["data"]["id"],
        "",
      )
      let edge3 = createEdgeList(
        data.edges,
        eid(VAR, id, VAR_TOP, id),
        list{"varedge", ...data.betaClasses},
        node2["data"]["id"],
        node3["data"]["id"],
        "",
      )
      let edge4 = createEdgeList(
        data.edges,
        eid(VAR_TOP, id, ABS_TOP, i),
        list{"arc", ...data.betaClasses},
        node3["data"]["id"],
        nid(ABS_TOP, i),
        lookup(data.ctx, x),
      )

      let midpoint = {
        "source": data.parent.node["data"]["id"],
        "midpoint": node1["data"]["id"],
        "target": node2["data"]["id"],
      }

      {
        nodes: list{node1, node2, node3},
        edges: list{edge1, edge2, edge3, edge4},
        midpoints: list{midpoint},
        stats: {...data.stats, vars: id + 1},
      }
    }
  | Abs(t, x, _) => {
      let classes = list{
        "midpoint",
        data.parent.nodeType == ROOT ? "term-edge" : "abs-edge",
        ...data.betaClasses,
      }

      let id = data.stats.abs
      let node1 = createNodeList(
        data.nodes,
        nid(ABS_MP, id),
        classes,
        mpPosX,
        mpPosY,
        prettyPrint(data.term, data.ctx, false, true),
      )
      let node2 = createNodeList(
        data.nodes,
        nid(ABS, id),
        list{"abstraction", ...data.betaClasses},
        posX,
        posY,
        lambda,
      )
      let node3 = createNodeList(
        data.nodes,
        nid(ABS_SP_MP, id),
        list{"midpoint", "abs-edge-r", ...data.betaClasses},
        posX + nodeDistanceX / 2,
        posY - nodeDistanceY / 2,
        x,
      )
      let node4 = createNodeList(
        data.nodes,
        nid(ABS_SP, id),
        list{"support", ...data.betaClasses},
        posX + nodeDistanceX,
        posY - nodeDistanceY,
        "",
      )
      let node5 = createNodeList(
        data.nodes,
        nid(ABS_TOP, id),
        list{"top", ...data.betaClasses},
        posX + nodeDistanceX,
        posY - 2 * nodeDistanceY,
        "",
      )

      let edge1 = createEdgeList(
        data.edges,
        eid(data.parent.nodeType, data.parent.id, ABS_MP, id),
        list{"absedge", ...data.betaClasses},
        data.parent.node["data"]["id"],
        node1["data"]["id"],
        "",
      )
      let edge2 = createEdgeList(
        data.edges,
        eid(ABS_MP, id, ABS, id),
        list{"absedge", ...data.betaClasses},
        node1["data"]["id"],
        node2["data"]["id"],
        "",
      )
      let edge3 = createEdgeList(
        data.edges,
        eid(ABS, id, ABS_SP_MP, id),
        list{"varedge", ...data.betaClasses},
        node2["data"]["id"],
        node3["data"]["id"],
        "",
      )
      let edge4 = createEdgeList(
        data.edges,
        eid(ABS_SP_MP, id, ABS_SP, id),
        list{"varedge", ...data.betaClasses},
        node3["data"]["id"],
        node4["data"]["id"],
        "",
      )
      let edge5 = createEdgeList(
        data.edges,
        eid(ABS_SP, id, ABS_TOP, id),
        list{"varedge", ...data.betaClasses},
        node4["data"]["id"],
        node5["data"]["id"],
        "",
      )

      let midpoint1 = {
        "midpoint": node1["data"]["id"],
        "source": data.parent.node["data"]["id"],
        "target": node2["data"]["id"],
      }
      let midpoint2 = {
        "midpoint": node3["data"]["id"],
        "source": node2["data"]["id"],
        "target": node4["data"]["id"],
      }

      let newNodes = list{node1, node2, node3, node4, node5}
      let newEdges = list{edge1, edge2, edge3, edge4, edge5}

      let nodes = List.concat(list{newNodes, data.nodes})
      let edges = List.concat(list{newEdges, data.edges})
      let scope = generateGraphElements'({
        term: t,
        ctx: list{x, ...data.ctx},
        dict: list{(id, true), ...data.dict},
        nodes: nodes,
        edges: edges,
        parent: {node: node2, id: data.stats.abs, nodeType: ABS},
        dir: L,
        stats: {...data.stats, abs: data.stats.abs + 1},
        betaClasses: data.betaClasses,
      })

      let srightmost = furthestRight(scope.nodes)
      let scopeNodes =
        srightmost >= posX
          ? shiftNodeX(scope.nodes, -(srightmost - posX) - nodeDistanceX)
          : scope.nodes

      {
        nodes: List.concat(list{scopeNodes, newNodes}),
        edges: List.concat(list{scope.edges, newEdges}),
        midpoints: list{midpoint1, midpoint2, ...scope.midpoints},
        stats: scope.stats,
      }
    }
  | App(t1, t2, _) => {
      let labelclass = switch data.dir {
      | U => "term-edge"
      | L => "app-edge-l"
      | R => "app-edge-r"
      }
      let id = data.stats.apps
      let node1 = createNodeList(
        data.nodes,
        nid(APP_MP, id),
        list{"midpoint", labelclass, ...data.betaClasses},
        mpPosX,
        mpPosY,
        prettyPrint(data.term, data.ctx, false, true),
      )
      let node2 = createNodeList(
        data.nodes,
        nid(APP, id),
        isBetaRedex(data.term)
          ? list{"application", "beta-" ++ str(data.stats.betas), ...data.betaClasses}
          : list{"application", ...data.betaClasses},
        posX,
        posY,
        "@",
      )

      let edge1 = createEdgeList(
        data.edges,
        eid(data.parent.nodeType, data.parent.id, APP_MP, id),
        list{"appedge", ...data.betaClasses},
        data.parent.node["data"]["id"],
        node1["data"]["id"],
        "",
      )
      let edge2 = createEdgeList(
        data.edges,
        eid(APP_MP, id, APP, id),
        list{"appedge", ...data.betaClasses},
        node1["data"]["id"],
        node2["data"]["id"],
        "",
      )

      let midpoint = {
        "midpoint": node1["data"]["id"],
        "source": data.parent.node["data"]["id"],
        "target": node2["data"]["id"],
      }

      let lhs = generateGraphElements'({
        term: t1,
        ctx: data.ctx,
        dict: data.dict,
        nodes: list{node1, node2, ...data.nodes},
        edges: list{edge1, edge2, ...data.edges},
        parent: {node: node2, id: id, nodeType: APP},
        dir: L,
        stats: {...data.stats, apps: data.stats.apps + 1, betas: data.stats.betas + 1},
        betaClasses: list{"beta-" ++ str(data.stats.betas), ...data.betaClasses},
      })
      let rhs = generateGraphElements'({
        term: t2,
        ctx: data.ctx,
        dict: data.dict,
        nodes: data.nodes,
        edges: data.edges,
        parent: {node: node2, id: id, nodeType: APP},
        dir: R,
        stats: lhs.stats,
        betaClasses: list{"beta-" ++ str(data.stats.betas), ...data.betaClasses},
      })

      let lhsRightmost = furthestRight(lhs.nodes)
      let lhsNodes =
        lhsRightmost >= posX
          ? shiftNodeX(lhs.nodes, -(lhsRightmost - posX) - nodeDistanceX)
          : lhs.nodes

      let rhsLeftmost = furthestLeft(rhs.nodes)
      let rhsNodes =
        rhsLeftmost <= posX ? shiftNodeX(rhs.nodes, posX - rhsLeftmost + nodeDistanceX) : rhs.nodes

      {
        nodes: List.concat(list{lhsNodes, rhsNodes, list{node1, node2}}),
        edges: List.concat(list{lhs.edges, rhs.edges, list{edge1, edge2}}),
        midpoints: list{midpoint, ...List.concat(list{lhs.midpoints, rhs.midpoints})},
        stats: rhs.stats,
      }
    }
  }
}

let generateGraphElementsArray = (term, ctx) => {
  let (nodes, edges, frees, midpoints) = generateGraphElements(term, ctx)
  (Array.of_list(nodes), Array.of_list(edges), Array.of_list(frees), Array.of_list(midpoints))
}
