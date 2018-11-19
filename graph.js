/** Array containing all node ids used in the current graph */
var nodes = [];
/** Array containing all node objects used in the current graph */
var nodeObjs = [];
/** Array containing all edge ids used in the current graph */
var edges = [];
/** The graph object */
var cy = undefined;
/** Constants to represent the location of a child relative to its parent */
const LHS = 0;
const RHS = 1;
/** The current position of the parent */
var parentPos = [0,0];
/** The distance between nodes */
const nodeDistanceX = 100;
const nodeDistanceY = 50;

/**
 * Reset the nodes and edges arrays
 */
function reset(){
    nodes = [];
    nodeObjs = [];
    edges = [];
    cy = undefined;
    firstNode = undefined;
    parent = [0,0];
    parentType = undefined;
}

/**
 * Find the node that generates a given function (could be an abstraction or an application!).
 * @param {string} fun The name of the function.
 */
function findNode(fun){

    var funComps = fun.split(' ');
    
    if(funComps.length === 2){
        fun = funComps[0] + " @ " + funComps[1];
    }

    console.log("Looking for function " + fun);

    for(i = 0; i < nodeObjs.length; i++){

        var id = nodeObjs[i].data.id;

        if(nodeObjs[i].data.type === "abs-node"){

            if(id.substring(1, id.length - 1) === fun){
                return nodeObjs[i];
            }

        } else if(nodeObjs[i].data.type === "app-node"){

            var lhs = id.substring(1, id.length - 1);

            console.log("Comparing function " + fun + " with " + lhs);

            if(lhs === fun){
                return nodeObjs[i];

            }
        }

    }

    return null;
}

/**
 * Convert a lambda expression into an array of all the graph elements
 * @param {Object} term - The term to convert into an array of elements.
 * @param {Object[]} array - The array to place all the elements into.
 * @param {Object} parent - The parent of the current term (can be undefined).
 * @param {number} parentType - The type of the parent node (can be undefined).
 * @return {Object[]} The array containing all of the elements.
 */
function convertToElems(term, array, parent, parentType){

    // At the first level an empty array must be created
    if(array === undefined){
        array = [];
    }

    var posX;
    var posY;

    // Root of lambda expression is connected to the root (represented as box) node
    if(parent === undefined){
        var startNode = { data: { id: ">"}, position: { x: 0, y: 0}};
        parent = ">";

        posX = 0;
        posY = -nodeDistanceY;

        array = pushNode(array, startNode, ">");

    } else {

        switch(parentType){
            case LHS:
                posX = parentPos[0] - nodeDistanceX;
                posY = parentPos[1] - nodeDistanceY;
                break;
            case RHS:
                posX = parentPos[0] + nodeDistanceX;
                posY = parentPos[1] - nodeDistanceY;
                break;
        }

    }

    parentPos = [posX, posY];

    switch(term.getType()){

        /*
         * An abstraction creates a node.
         * This node has many (linear: only one) outgoing edges that 'feed' the abstracted variable into applications.
         * This node has one ingoing edge from the scope of the abstraction.
         */
        case ABS:

            var nodeID = checkID("\u03BB" + term.label + ".", nodes);

            // The lambda node

            var lambdaNode = { data: { id: nodeID, type: "abs-node" }, position: {x: posX, y: posY}};

            console.log(posX + ", " + posY);

            array = pushNode(array, lambdaNode, nodeID);

            // The edge linking the lambda node with its parent
            
            var edgeID = checkID(nodeID + " " + term.t.prettyPrintLabels(), edges);
            var edge = { data: { id: edgeID, source: nodeID, target: parent, type: "abs-edge"}};
            array = pushEdge(array, edge, edgeID);

            // Go inside the abstraction
            array = convertToElems(term.t, array, nodeID, LHS);

            break;

        /*
         * An application creates a node.
         * This node has one ougoing edge that 'feeds' the application to its parent (be it another application or an abstraction).
         * This node has two ingoing edges from the two terms that make up the application.
         */
        case APP:

            var nodeID = checkID("[" + term.t1.prettyPrintLabels() + " @ " + term.t2.prettyPrintLabels() + "]", nodes);
            
            // The application node

            var appNode = { data: { id: nodeID, type: "app-node" },  position: {x: posX, y: posY}};

            console.log(posX + ", " + posY);

            array = pushNode(array, appNode, nodeID);
            
            // Check to see if the lhs is a variable
            if(term.t1.getType() === VAR){

                var newNode = { data: { id: nodeID + "support", type: "app-supp" },  position: {x: posX, y: posY - nodeDistanceY}};
                array = pushNode(array, newNode, nodeID + "support");

                var edgeID = checkID("(" + term.t1.label + " in " + nodeID + ")", edges);
                var sourceID = "\u03BB" + term.t1.label + ".";
                var classes = "";

                if(!nodes.includes(sourceID)){
                    var externalNode = { data: { id: sourceID, type: "abs-node" }, classes: 'global'};
                    array = pushNode(array, externalNode, sourceID);
                    classes = 'dashed';
                }

                var t1edge = { data: { id: edgeID, source: sourceID, target: nodeID + "support", type: "var-edge" }};
                array = pushEdge(array, t1edge, edgeID);

                var newEdge = { data: { id: edgeID + "supp", source: nodeID + "support", target: nodeID, type: "var-edge-supp" }};
                array = pushEdge(array, newEdge, edgeID + "supp");

            } else {
                array = convertToElems(term.t1, array, nodeID, LHS);
            }

            // Check to see if the rhs is a variable
            if(term.t2.getType() === VAR){

                var edgeID = checkID("(" + term.t2.label + " in " + nodeID + ")", edges);
                var sourceID = "\u03BB" + term.t2.label + "."; 
                var classes = "";
                
                if(!nodes.includes(sourceID)){
                    var externalNode = { data: { id: sourceID, type: "abs-node" }, classes: 'global' };
                    array = pushNode(array, externalNode, sourceID);
                    classes = 'dashed'
                }

                var t2edge = { data: { id: edgeID, source: sourceID, target: nodeID, type: "var-edge" }};
                array = pushEdge(array, t2edge, edgeID);

            } else {
                array = convertToElems(term.t2, array, nodeID, RHS);
            }

            // The edge linking the application node with its parent
            var edgeID = checkID("(" + nodeID + ")", edges);
            var edge = { data: { id: edgeID, source: nodeID, target: parent, type: "app-edge" }};
            array = pushEdge(array, edge, edgeID);

            break;

        /*
         * A lone variable creates an edge from where it was abstracted to where it is being applied.
         */
        case VAR:

            // If a lone variable has been encountered it's an application with the id function
            
            var sourceID = "\u03BB" + term.label + ".";

            if(!nodes.includes(sourceID)){
                var externalNode = { data: { id: sourceID, type: "abs" }, classes: 'global'}
                array = pushNode(array, externalNode, sourceID);
            }
            
            var edgeID = "id " + term.label;
            var idEdge = { data: {id: edgeID, source: sourceID, target: parent, type: "id" }};
            
            array = pushEdge(array, idEdge, edgeID);

            break;

    }

    return array;

}

/**
 * Fix the support node positions in the array of elements.
 */
function fixSupports(elems){

    var ys = [];

    for(i = 0; i < elems.length; i++){
        ys[i] = elems[i].position('y');
    }

    for(i = 0; i < elems.length; i++){
        //elems[i].position('y', ys[ys.length - i - 1]);
    }

}

/**
 * Push a node onto the various arrays.
 * @param {Object[]} array - The array all the elements are stored in.
 * @param {Object} node - The node object.
 * @param {string} nodeID - The node ID.
 * @return {Object[]} The updated array all the elements are stored in.
 */
function pushNode(array, node, nodeID){
    smartPush(array, node);
    smartPush(nodes, nodeID);
    smartPush(nodeObjs, node);

    return array;
}

/**
 * Push an edge onto the various arrays.
 * @param {Object[]} array - The array all the elements are stored in.
 * @param {Object} edge - The edge object.
 * @param {string} edgeID - The edge ID.
 * @return {Object[]} The updated array all the elements are stored in.
 */
function pushEdge(array, edge, edgeID){
    smartPush(array, edge);
    smartPush(edges, edgeID);

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
 * Update the labels on the graph
 * @param {boolean} labels - Whether labels are shown
 */
function updateLabels(labels){

    if(labels){
        
        cy.style().selector('node[type = "abs-node"]').style({'label': '\u03BB'}).update();
        cy.style().selector('node[type = "app-node"]').style({'label': '@'}).update();
        cy.style().selector('edge[type = "abs-edge"]').style({'label': 'data(id)'}).update();
        
        cy.style().selector('edge[type = "id-edge"]').style({'label': function(ele){
            return ele.data().id.substring(3);
        }}).update();

        cy.style().selector('edge[type = "var-edge"]').style({'label': function(ele){
            var id = ele.data().id.substring(1);
            var res = id.split(" ");
            return res[0];
        }}).update();
        
        cy.style().selector('edge[type = "app-edge"]').style({'label': function(ele){
            
            var terms = ele.data().id.substring(2, ele.data().id.length - 2).split(" @ ");

            if(terms[1].split(" ").length > 1){
               terms[1] = "(" + terms[1] + ")";
            }

            if(terms[0].substring(0,1) === "\u03BB"){
                terms[0] = "(" + terms[0] + ")";
            }

            return terms[0] + " " + terms[1];

        }}).update();

    } else {
        cy.style().selector('node').style({'label': ''}).update();
        cy.style().selector('edge').style({'label': ''}).update();
    }
}

/**
 * Draw a graph representing a lambda term into the graph box.
 * @param {Object} term - The term to draw as a graph.
 */
function drawGraph(term){

    reset();

    var elems = convertToElems(term);

    cy = cytoscape({
        container: document.getElementById("cy"),

        elements: elems,
      
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#666',
                    'text-valign': 'center',
                    'color': 'white'
                }
            },
      
            {
                selector: 'node[type = "app-supp"]',
                style: {
                    'width': '10',
                    'height': '10',
                    'background-color': '#ccc',
                    'shape': 'roundrectangle'
                }
            },

            {
                selector: 'edge',
                style: {
                'width': 3,
                'line-color': '#ccc',
                'mid-target-arrow-color': '#ccc',
                'mid-target-arrow-shape': 'triangle',
                'arrow-scale': 1.2,
                }
            },

            {
                selector: 'edge[type = "var-edge"]',
                style: {
                    'curve-style': 'unbundled-bezier',
                    'control-point-distances': '200',
                    'control-point-weights': '0.25 0.5 0.75',
                    'loop-direction': '45deg',
                    'edge-distances': 'node-position'
                    
                }
            },

            {
                selector: '.global',
                style: {
                    'background-color': '#f00'
                }
            },

            {
                selector: '.dashed',
                style: {
                    'width': 5
                }
            },

        ],

        layout: {
            name: 'preset'
        }
  });

  fixSupports(cy.elements('node[type = "app-supp"]'));

  updateLabels(document.getElementById('labels-yes').checked);

}