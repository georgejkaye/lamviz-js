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
/** The distance between adjacent nodes in the X direction */
const nodeDistanceX = 30;
/** The distance between adjacent nodes in the Y direction */
const nodeDistanceY = 30;
/** The distance between support nodes and their parent in the X direction */
const supportDistanceX = 50;
/** The distance between support nodes and their parent in the Y direction */
const supportDistanceY = 50;

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
 * Generate the elements of the map of a term.
 * @param {Object} term - The lambda term to generate the elements of the map for.  
 * @param {Object[]} array - The array to put the elements in. 
 * @param {string} parent - The ID of the parent of the current term. 
 * @param {number} parentX - The x coordinate of the parent. 
 * @param {number} parentY - The y coordinate of the parent.
 * @param {number} position - The position relative to the parent (LHS or RHS) of the current element.
 * @return {Object[]} - The array of map elements.
 */
function generateMapElements(term, array, parent, parentX, parentY, position){

    /* If there is no element array, create one */
    if(array === undefined){
        array = [];
    }

    var posX = 0;
    var posY = 0;

    /* If this is the start of the map, create a root node. */
    if(parent === undefined){

        parent = ">";
        parentX = 0;
        parentY = 0;

        var rootNode = createNode(">", "root-node", parentX, parentY);
        array = pushNode(array, rootNode);

        posX = parentX;
        posY = parentY - nodeDistanceY;

    } else {

        posY = parentY - nodeDistanceY;

        if(position === LHS){
            posX = parentX - nodeDistanceX; 
        } else {
            posX = parentX + nodeDistanceX;
        }
    }

    var parentNodeID = "";
    var parentEdgeID = "";
    var parentEdgeType = "";

    switch(term.getType()){
        case ABS:

            parentNodeID = checkID("\u03BB" + term.label + ".", nodes);
            array = defineNode(array, parentNodeID, "abs-node", posX, posY);
    
            parentEdgeID = checkID(parentNodeID + " " + term.t.prettyPrintLabels(), edges);
            parentEdgeType = "abs-edge";

            const lambdaAbstractionSupportNodeID = checkID("\u03BB" + term.label + ".supp", nodes);
            array = defineNode(array, lambdaAbstractionSupportNodeID, "var-node-supp", posX + nodeDistanceX, posY - nodeDistanceY);

            const lambdaAbstractionSupportEdgeID = checkID("\u03BB" + term.label + ".supp1", edges);
            array = defineEdge(array, lambdaAbstractionSupportEdgeID, "var-edge-supp", parentNodeID, lambdaAbstractionSupportNodeID);

            const lambdaAbstractionSupportEdge2ID = checkID("\u03BB" + term.label + ".supp2", edges);
            array = defineEdge(array, lambdaAbstractionSupportEdge2ID, "var-edge-supp", parentNodeID, lambdaAbstractionSupportNodeID);

            var scopeArray = generateMapElements(term.t, array, parentNodeID, posX, posY, LHS);
            const rightmostScope = furthestRight(scopeArray);

            if(rightmostScope >= posX){
                scopeArray = shiftXs(scopeArray, -(rightmostScope - posX) - nodeDistanceX);
            }

            //for(i = 0; i < scopeArray.length; i++){
                //array = pushNode(array, scopeArray[i]);
            //}

            break;
            
        case APP:
            
            parentNodeID = checkID("[" + term.t1.prettyPrintLabels() + " @ " + term.t2.prettyPrintLabels() + "]", nodes);
            array = defineNode(array, parentNodeID, "app-node", posX, posY);

            parentEdgeID = checkID("(" + parentNodeID + ")", edges);
            parentEdgeType = "app-edge";
            
            var lhsArray = generateMapElements(term.t1, [], parentNodeID, posX, posY, LHS);
            const rightmostLHS = furthestRight(lhsArray);

            var rhsArray = generateMapElements(term.t2, [], parentNodeID, posX, posY, RHS);
            const leftmostRHS = furthestLeft(rhsArray);

            if(rightmostLHS >= posX){
                lhsArray = shiftXs(lhsArray, -(rightmostLHS - posX) - nodeDistanceX);
            }

            if(leftmostRHS <= posX){
                rhsArray = shiftXs(rhsArray, (posX - leftmostRHS) + nodeDistanceX);
            }

            for(i = 0; i < lhsArray.length; i++){
                array = pushNode(array, lhsArray[i]);
            }

            for(j = 0; j < rhsArray.length; j++){
                array = pushNode(array, rhsArray[j]);
            }

            break;

        case VAR:

            parentNodeID = checkID(term.label, nodes);
            array = defineNode(array, parentNodeID, "var-node-supp", posX, posY);

            parentEdgeID = checkID(term.label + " in " + parent + "supp", edges);
            parentEdgeType = "var-edge-supp";

            const lambdaVariableSupportNodeID = checkID(term.label + "supp", nodes);
            array = defineNode(array, lambdaVariableSupportNodeID, "var-node-supp", posX, posY - nodeDistanceY);

            const lambdaVariableSupportEdgeID = checkID(term.label + " in " + parent + "supp1", edges);
            array = defineEdge(array, lambdaVariableSupportEdgeID, "var-edge-supp", lambdaVariableSupportNodeID, parentNodeID);

            const lambdaVariableAbstractionEdgeID = checkID(term.label + " in " + parent + "supp2", edges);
            array = defineEdge(array, lambdaVariableAbstractionEdgeID, "var-edge", "\u03BB" + term.label + ".supp", lambdaVariableSupportNodeID);

            break;
    }

    /* Create an edge linking the newest node with its parent */
    array = defineEdge(array, parentEdgeID, parentEdgeType, parentNodeID, parent);

    return array;
    
}

/**
 * Define a node and add it to the array of map elements
 * @param {Object[]} array  - The array of all the map elements.
 * @param {string} id       - The desired node ID.
 * @param {string} type     - The type of this node. 
 * @param {number} posX     - The x coordinate of this node.
 * @param {number} posY     - The y coordinate of this node.
 * @return {Object[]} The updated array of map elements.
 */
function defineNode(array, id, type, posX, posY){
    
    const nodeID = checkID(id, nodes);
    const node = createNode(nodeID, type, posX, posY);
    array = pushNode(array, node, nodeID);

    return array;
}

/**
 * Define an edge and add it to the array of map elements
 * @param {Object[]} array  - The array of all the map elements.
 * @param {string} id       - The desired edge ID.
 * @param {string} type     - The type of edge. 
 * @param {number} source   - The source of this edge.
 * @param {number} target   - The target of this edge.
 * @return {Object[]} The updated array of map elements.
 */
function defineEdge(array, id, type, source, target){
    
    const edgeID = checkID(id, edges);
    const edge = createEdge(edgeID, type, source, target);
    array = pushEdge(array, edge, edgeID);

    return array;
}

/**
 * Create a node on the map.
 * @param {string} id   - The id of the node.
 * @param {string} type - The type of the node.
 * @param {number} x    - The x coordinate of the node (optional).
 * @param {number} y    - The y coordinate of the node (optional).
 * @return {Object} The node object.
 */
function createNode(id, type, x, y){
    
    if(x === undefined || y === undefined){
        return { data: { id: id, type: type}};
    }

    return { data: { id: id, type: type}, position: {x: x, y: y}};

}

/**
 * Create an edge on the map.
 * @param {string} id       - The id of the edge .
 * @param {string} type     - The type of the edge.
 * @param {string} source   - The source of the edge.
 * @param {string} target   - The target of the edge.
 * @return {Object} The edge object.
 */
function createEdge(id, type, source, target){
    return { data: { id: id, source: source, target: target, type: type}};
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
 * Get the furthest left x coordinate of a node in an array of elements
 * @param {Object[]} array - The array of elements
 * @return {number} the furthest left x coordinate
 */
function furthestLeft(array){

    left = array[0].position.x;

    for(i = 1; i < array.length; i++){

        if(array[i].position !== undefined){
            const newLeft = array[i].position.x;

            if(newLeft < left){
                left = newLeft;
            }
        }
    }

    return left;
}

/**
 * Get the furthest right x coordinate of a node in an array of elements.
 * @param {Object[]} array - The array of elements.
 * @return {number} the furthest left x coordinate.
 */
function furthestRight(array){

    var right = array[0].position.x;

    for(i = 1; i < array.length; i++){

        if(array[i].position !== undefined){
            const newRight = array[i].position.x;

            if(newRight > right){
                right = newRight;
            }
        }
    }

    return right;
}

/**
 * Shift all the x coordinates of nodes in an array of elements.
 * @param {Object[]} array - The array of elements. 
 * @param {number} x - The amount to shift the x coordinates. 
 * @param {Object[]} - The array with all the elements shifted.
 */
function shiftXs(array, x){

    for(i = 0; i < array.length; i++){
        if(array[i].position !== undefined){

            array[i].position.x += x;
        } 
    }

    return array;
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
            var id = ele.data().id.substring(0);
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

    var elems = generateMapElements(term);

    cy = cytoscape({
        container: document.getElementById("cy"),

        elements: elems,
      
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#666',
                    'text-valign': 'center',
                    'color': 'white',
                    'width': '15',
                    'height': '15',
                    'font-size': '10'
                }
            },
      
            {
                selector: 'node[type = "var-node-supp"]',
                style: {
                    'width': '5',
                    'height': '5',
                    'background-color': '#ccc',
                    'shape': 'roundrectangle'
                }
            },

            {
                selector: 'edge',
                style: {
                'width': 2,
                'line-color': '#ccc',
                'mid-target-arrow-color': '#ccc',
                'mid-target-arrow-shape': 'triangle',
                'arrow-scale': '0.8',
                'font-size': '6'
                }
            },

            {
                selector: 'edge[type = "var-edge"]',
                style: {
                    'curve-style': 'unbundled-bezier',
                    'control-point-weights': '0.5',
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

  updateLabels(document.getElementById('labels-yes').checked);

}