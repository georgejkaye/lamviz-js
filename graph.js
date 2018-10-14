function convertToElems(term, array, env, parent){

    if(parent === undefined){
        var startNode = { data: { id: "\u25A1"}};
        parent = "\u25A1";
        smartPush(array, startNode);
    }

    switch(term.getType()){
        case ABS:

            var nodeID = "\u03BB" + term.label;

            // the lambda node
            var lambdaNode = { data: { id: nodeID }};
            smartPush(array, lambdaNode);

            // the edge linking the lambda node with its parent
            var edge = { data: { id: parent + " \u2192 " + nodeID, source: nodeID, target: parent }};
            smartPush(array, edge);

            // go inside the abstraction
            array = convertToElems(term.t, array, env, nodeID);
            
            break;

        case APP:

            var nodeID = term.t1.prettyPrintLabels() + " @ " + term.t2.prettyPrintLabels();
            
            // the application node
            var appNode = { data: { id: nodeID }};
            smartPush(array, appNode);

            // the edge linking the application node with its parent
            var edge = { data: { id: parent + " \u2192 " + nodeID, source: nodeID, target: parent }};
            smartPush(array,edge);

            // check to see if the lhs is a variable
            if(term.t1.getType() === VAR){
                var t1edge1 = { data: { id: term.t1.label + " in " + nodeID, source: "\u03BB" + term.t1.label, target: nodeID }};
                smartPush(array, t1edge1);
            } else {
                array = convertToElems(term.t1, array, env, nodeID);
            }

            // check to see if the rhs is a variable
            if(term.t2.getType() === VAR){
                var t2edge1 = { data: { id: term.t2.label + " in " + nodeID, source: "\u03BB" + term.t2.label, target: nodeID }};
                smartPush(array, t2edge1);
            } else {
                array = convertToElems(term.t2, array, env, nodeID);
            }
            
            break;

        case VAR:

            // if a lone variable has been encountered it's effectively an application with the id function
            var idEdge = { data: {id: "id " + term.label, source: "\u03BB" + term.label, target: parent }};
            smartPush(array, idEdge);

            break;

    }

    return array;

}

/**
 * Draw a graph representing a lambda term into the graph box
 */
function drawGraph(term){

  var elems = convertToElems(term, [], new LambdaEnvironment());
  
  var cy = cytoscape({
      container: document.getElementById("cy"),

      elements: elems,
      
        style: [ // the stylesheet for the graph
          {
            selector: 'node',
            style: {
              'background-color': '#666',
              'label': 'data(id)'
            }
          },
      
          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#ccc',
              'mid-target-arrow-color': '#ccc',
              'mid-target-arrow-shape': 'triangle',
              'arrow-scale': 2,
              'curve-style': 'bezier',
              'control-point-step-size': '200px'
            }
          }
        ],
      
        layout: {
          name: 'circle',
          startAngle: 5 / 2 * Math.PI
        }

  });
}