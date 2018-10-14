/** Array containing all nodes used in the current graph */
var nodes = [];
/** Array containing all edges used in the current graph */
var edges = [];

/**
 * Reset the nodes and edges arrays
 */
function reset(){
    nodes = [];
    edges = [];
}

/**
 * Convert a lambda expression into an array of all the graph elements
 * @param {Object} term - The term to convert into an array of elements.
 * @param {Object[]} array - The array to place all the elements into.
 * @param {Object} parent - The parent of the current term (can be undefined).
 * @param {Object} edges - The list of edges in the graph (for when edges are named the same).
 * @return {Object[]} The array containing all of the elements.
 */
function convertToElems(term, array, parent){

    // At the first level an empty array must be created
    if(array === undefined){
        array = [];
    }

    // Root of lambda expression is connected to the root (represented as box) node
    if(parent === undefined){
        var startNode = { data: { id: ">"}};
        parent = ">";
        smartPush(array, startNode);
    }

    switch(term.getType()){

        /*
         * An abstraction creates a node.
         * This node has many outgoing edges that 'feed' the abstracted variable into applications.
         * This node has one ingoing edge from the scope of the abstraction.
         */
        case ABS:

            var nodeID = checkID("\u03BB" + term.label + ".", nodes);

            // The lambda node
            var lambdaNode = { data: { id: nodeID }};
            smartPush(array, lambdaNode);
            smartPush(nodes, nodeID);

            // The edge linking the lambda node with its parent
            
            var edgeID = checkID(parent + " " + nodeID + " " + term.t.prettyPrintLabels(), edges);
            var edge = { data: { id: edgeID, source: nodeID, target: parent }};
            smartPush(array, edge);
            smartPush(edges, edgeID);

            // Go inside the abstraction
            array = convertToElems(term.t, array, nodeID);
            
            break;

        /*
         * An application creates a node.
         * This node has one ougoing edge that 'feeds' the application to its parent (be it another application or an abstraction).
         * This node has two ingoing edges from the two terms that make up the application.
         */
        case APP:

            var nodeID = checkID("[" + term.t1.prettyPrintLabels() + " @ " + term.t2.prettyPrintLabels() + "]", nodes);
            
            // The application node
            var appNode = { data: { id: nodeID }};
            smartPush(array, appNode);
            smartPush(nodes, nodeID);

            // The edge linking the application node with its parent
            var edgeID = checkID("(" + nodeID + ")", edges);
            var edge = { data: { id: edgeID, source: nodeID, target: parent }};
            smartPush(array, edge);
            smartPush(edges, edgeID);

            // Check to see if the lhs is a variable
            if(term.t1.getType() === VAR){

                var edgeID = checkID("(" + term.t1.label + " in " + nodeID + ")", edges);
                var t1edge = { data: { id: edgeID, source: "\u03BB" + term.t1.label + ".", target: nodeID }};
                smartPush(array, t1edge);
                smartPush(edges, edgeID);

            } else {
                array = convertToElems(term.t1, array, nodeID);
            }

            // Check to see if the rhs is a variable
            if(term.t2.getType() === VAR){

                var edgeID = checkID("(" + term.t2.label + " in " + nodeID + ")", edges);
                var t2edge = { data: { id: edgeID, source: "\u03BB" + term.t2.label + ".", target: nodeID }};
                smartPush(array, t2edge);
                smartPush(edges, edgeID);

            } else {
                array = convertToElems(term.t2, array, nodeID);
            }
            
            break;

        /*
         * A lone variable creates an edge from where it was abstracted to where it is being applied.
         */
        case VAR:

            // If a lone variable has been encountered it's an application with the id function
            var idEdge = { data: {id: "id " + term.label, source: "\u03BB" + term.label, target: parent }};
            smartPush(array, idEdge);

            break;

    }

    return array;

}

/**
 * Check to make sure an id is not used in an array, and suffixes a prime (') after it if it does.
 * @param {string} id - The id to check.
 * @param {Object[]} array - The array to search for duplicates in.
 * @return {string} The id, suffixed with primes if necessary.
 */
function checkID(id, array){
    
    while(array.includes(id)){
        id += "\'";
    }

    return id;
}

/**
 * Draw a graph representing a lambda term into the graph box.
 * @param {Object} term - The term to draw as a graph.
 */
function drawGraph(term){

    reset();

    var elems = convertToElems(term);
    
    var cy = cytoscape({
        container: document.getElementById("cy"),

        elements: elems,
      
        style: [
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
                'control-point-step-size': '200px',
                'label': 'data(id)'
                }
            }
        ],
      
        layout: {
            name: 'circle',
            startAngle: 5 / 2 * Math.PI
        }

  });
}