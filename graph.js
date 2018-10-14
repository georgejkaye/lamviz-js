/**
 * Convert a lambda expression into an array of all the graph elements
 * @param {Object} term - The term to convert into an array of elements.
 * @param {Object[]} array - The array to place all the elements into.
 * @param {Object} parent - The parent of the current term (can be undefined).
 * @param {Object} edges - The list of edges in the graph (for when edges are named the same).
 * @return {Object[]} The array containing all of the elements.
 */
function convertToElems(term, array, parent, edges){

    // At the first level an empty array must be created
    if(array === undefined){
        array = [];
    }

    // Root of lambda expression is connected to the root (represented as box) node
    if(parent === undefined){
        var startNode = { data: { id: "\u25A1"}};
        parent = "\u25A1";
        smartPush(array, startNode);
    }

    if(edges === undefined){
        edges = [];
    }

    switch(term.getType()){
        case ABS:

            var nodeID = "\u03BB" + term.label;

            // The lambda node
            var lambdaNode = { data: { id: nodeID }};
            smartPush(array, lambdaNode);

            // The edge linking the lambda node with its parent
            
            var edgeID = checkEdge(parent + " \u2192 " + term.t.prettyPrintLabels(), edges);
            var edge = { data: { id: edgeID, source: nodeID, target: parent }};
            smartPush(array, edge);
            smartPush(edges, edgeID);

            // Go inside the abstraction
            array = convertToElems(term.t, array, nodeID);
            
            break;

        case APP:

            var nodeID = term.t1.prettyPrintLabels() + " @ " + term.t2.prettyPrintLabels();
            
            // The application node
            var appNode = { data: { id: nodeID }};
            smartPush(array, appNode);

            // The edge linking the application node with its parent
            var edgeID = checkEdge(parent + " \u2192 " + nodeID, edges);
            var edge = { data: { id: edgeID, source: nodeID, target: parent }};
            smartPush(array, edge);
            smartPush(edges, edgeID);

            // Check to see if the lhs is a variable
            if(term.t1.getType() === VAR){

                var edgeID = checkEdge(term.t1.label + " in " + nodeID, edges);

                var t1edge = { data: { id: edgeID, source: "\u03BB" + term.t1.label, target: nodeID }};
                smartPush(array, t1edge);
                smartPush(edges, edgeID);

            } else {
                array = convertToElems(term.t1, array, nodeID);
            }

            // Check to see if the rhs is a variable
            if(term.t2.getType() === VAR){

                var edgeID = checkEdge(term.t2.label + " in " + nodeID, edges);

                var t2edge = { data: { id: edgeID, source: "\u03BB" + term.t2.label, target: nodeID }};
                smartPush(array, t2edge);
                smartPush(edges, edgeID);

            } else {
                array = convertToElems(term.t2, array, nodeID);
            }
            
            break;

        case VAR:

            // If a lone variable has been encountered it's an application with the id function
            var idEdge = { data: {id: "id " + term.label, source: "\u03BB" + term.label, target: parent }};
            smartPush(array, idEdge);

            break;

    }

    return array;

}

function checkEdge(edgeID, edges){
    
    while(edges.includes(edgeID)){
        edgeID += "\'";
    }

    return edgeID;
}

/**
 * Draw a graph representing a lambda term into the graph box.
 * @param {Object} term - The term to draw as a graph.
 */
function drawGraph(term){

  var elems = convertToElems(term);
  
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