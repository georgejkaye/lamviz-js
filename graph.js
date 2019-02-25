/**
 * Functions to generate and draw the lambda term maps.
 * 
 * @author George Kaye
 */

/** Array containing all node ids used in the current graph. */
var nodes = [];
/** Array containing all node objects used in the current graph. */
var nodeObjs = [];
/** Array containing all edge objects used in the current graph. */
var edgeObjs = [];
/** Array containing all edge ids used in the current graph. */
var edges = [];
/** The map object */
var cyMap = undefined;
/** The normalisation graph object */
var cyNorm = undefined;
/** Constants to represent the location of a child relative to its parent. */
const LHS = 0;
const RHS = 1;
/** The distance between adjacent nodes in the X direction. */
const nodeDistanceX = 30;
/** The distance between adjacent nodes in the Y direction. */
const nodeDistanceY = 30;
/** The distance between adjacent normalisation nodes in the X direction. */
const normalisationDistanceX = 2000;
/** The distance between adjacent normalisation nodes in the Y direction. */
const normalisationDistanceY = 2000;
/** The width of one normalisation node. */
const normalisationNodeWidth = 150;
/** The original style sheet */
var style = undefined;

var originalTerm = undefined;

/** Constants for the different types of graph elements. */
/** A node representing an abstraction. */
const absNode = "abs-node";
/** A node representing an abstraction of a free variable. */
const absNodeFree = "abs-node-free";
/** An edge carrying an abstraction. */
const absEdge = "abs-edge";
/** A node representing an application. */
const appNode = "app-node";
/** An edge carrying an application. */
const appEdge = "app-edge";
/** A node supporting a variable */
const varNode = "var-node";
/** A node supporting a variable at the top of the page. */
const varNodeTop = "var-node-top";
/** An edge carrying a variable (no label). */
const varEdge = "var-edge";
/** An edge carrying a variable (with label). */
const varEdgeLabel = "var-label-edge";

/** A lambda character */
const lambda = "\u03BB";

/** How many redexes have been encountered so far. */
var redexIndex = 0;
/** An array of nodes that need to have redexes propogated to their abstraction. */
var redexList = [];
/** IDs of the actual redex edges */
var redexEdgeIDs = [];
/** Images for the reduction graph */
var imgs = [];

/**
 * Reset the nodes and edges arrays.
 */
function reset(map){
    
    nodes = [];
    nodeObjs = [];
    edges = [];
    edgeObjs = [];
    redexIndex = 0;
    redexList = [];
    redexEdgeIDs = [];

    if(map){
        cyMap = undefined;
    } else {
        cyNorm = undefined;
    }
}

/**
 * Generate the elements of the map of a term.
 * @param   {Object}      term       - The lambda term to generate the elements of the map for.  
 * @param   {Object[]}    ctx        - The context containing all the free variables.
 * @param   {Object[]}    array      - The array to put the elements in. 
 * @param   {string}      parent     - The ID of the parent of the current term. 
 * @param   {number}      parentX    - The x coordinate of the parent. 
 * @param   {number}      parentY    - The y coordinate of the parent.
 * @param   {number}      position   - The position relative to the parent (LHS or RHS) of the current element.
 * @param   {number[]}    redexes    - The indices of the redexes that the current term is inside.
 * @param   {boolean}     redexEdge  - If a redex has just occurred.
 * @return  {Object[]}               - The array of map elements.
 */
function generateMapElements(term, ctx, array, parent, parentX, parentY, position, redexes, redexEdge){

    /* If there is no context, create one */
    if(ctx === undefined){
        ctx = new LambdaEnvironment();
    }

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

        var rootNode = createNode(">", "root-node", "", parentX, parentY);
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

    if(redexes === undefined){
        redexes = [];
    }

    if(redexEdge === undefined){
        redexEdge = false;
    }

    var classes = betaClasses(redexes);

    var newNodeID = "";
    var newEdgeID = "";
    var newEdgeType = "";
    var newEdgeLabel = "";

    switch(term.getType()){
        case ABS:

            var abstractionLabel = term.label;

            newNodeID = checkID(lambda + abstractionLabel, nodes);
            
            var nodeLabel = lambda + abstractionLabel + "."

            array = defineNode(array, newNodeID, absNode, classes, posX, posY, nodeLabel);
    
            newEdgeID = checkID(newNodeID + " " + term.t.prettyPrintLabels(), edges);
            newEdgeType = absEdge;
            newEdgeLabel = nodeLabel + " " + term.t.prettyPrintLabels();

            /* The abstracted variable goes NE */
            const lambdaAbstractionSupportNodeID = checkID(newNodeID + "._abstraction_node_right", nodes);
            array = defineNode(array, lambdaAbstractionSupportNodeID, varNode, classes, posX + nodeDistanceX, posY - nodeDistanceY);

            const lambdaAbstractionSupportEdgeID = checkID(newNodeID + "._node_from_abstraction_to_right", edges);
            array = defineEdge(array, lambdaAbstractionSupportEdgeID, varEdge, classes, newNodeID, lambdaAbstractionSupportNodeID);

            /* The abstracted variable travels to the top of the map */
            const lambdaAbstractionSupportNode2ID = checkID(newNodeID + "._abstraction_node_top", nodes);
            array = defineNode(array, lambdaAbstractionSupportNode2ID, varNodeTop, classes, posX + nodeDistanceX, posY - (2 * nodeDistanceY));

            const lambdaAbstractionSupportEdge2ID = checkID(newNodeID + "._edge_from_abstraction_to_top", edges);
            array = defineEdge(array, lambdaAbstractionSupportEdge2ID, varEdge, classes, lambdaAbstractionSupportNodeID, lambdaAbstractionSupportNode2ID);

            /* Generate the elements for the scope of the abstraction */
            ctx.pushTerm(newNodeID.substring(1), abstractionLabel);
            var scopeArray = generateMapElements(term.t, ctx, [], newNodeID, posX, posY, LHS, redexes);
            ctx.popTerm();
            
            const rightmostScope = furthestRight(scopeArray);

            /* Make sure the scope is entirely to the left of the abstraction node */
            if(rightmostScope >= posX){
                scopeArray = shiftXs(scopeArray, -(rightmostScope - posX) - nodeDistanceX);
            }

            for(i = 0; i < scopeArray.length; i++){
                array.push(scopeArray[i]);
            }

            break;
            
        case APP:
            
            var isRedex = false;

            if(term.isBetaRedex()){
                smartPush(redexes, redexIndex);
                redexIndex++;
                classes = betaClasses(redexes);
                isRedex = true;
            }

            newNodeID = checkID("[" + term.t1.prettyPrintLabels() + " @ " + term.t2.prettyPrintLabels() + "]", nodes);
            array = defineNode(array, newNodeID, appNode, classes, posX, posY);

            newEdgeID = checkID("(" + newNodeID + ")", edges);
            newEdgeType = appEdge;
            
            /* Generate the elements for the LHS of the application */
            var lhsArray = generateMapElements(term.t1, ctx, [], newNodeID, posX, posY, LHS, redexes, isRedex);
            const rightmostLHS = furthestRight(lhsArray);

            /* Generate the elements for the RHS of the application */
            var rhsArray = generateMapElements(term.t2, ctx, [], newNodeID, posX, posY, RHS, redexes);
            const leftmostRHS = furthestLeft(rhsArray);

            /* Make sure the LHS is entirely to the left of the application node */
            if(rightmostLHS >= posX){
                lhsArray = shiftXs(lhsArray, -(rightmostLHS - posX) - nodeDistanceX);
            }

            /* Make sure the RHS is entirely to the right of the application node */
            if(leftmostRHS <= posX){
                rhsArray = shiftXs(rhsArray, (posX - leftmostRHS) + nodeDistanceX);
            }

            for(i = 0; i < lhsArray.length; i++){
                array.push(lhsArray[i]);
            }

            for(j = 0; j < rhsArray.length; j++){
                array.push(rhsArray[j]);
            }

            if(term.isBetaRedex()){
                redexes.pop();               
                classes = betaClasses(redexes);
            }

            break;

        case VAR:

            var variableID = ctx.getCorrespondingVariable(term.index);
            var variableLabel = ctx.getCorrespondingVariable(term.index, true);

            /* Create the first node in the variable edge, to pull it away from the parent in the right direction */
            newNodeID = checkID(variableID + "_variable_node", nodes);
            array = defineNode(array, newNodeID, varNode, classes, posX, posY);

            /* Create the edge between the parent and the variable node */
            newEdgeID = checkID(variableID + " in " + parent + "_edge_from_parent_to_variable", edges);
            newEdgeType = varEdge;

            /* Create the node at the top of the page for this variable to travel from */
            const lambdaVariableSupportNodeID = checkID(variableID + "_variable_node_top", nodes);
            array = defineNode(array, lambdaVariableSupportNodeID, varNodeTop, classes, posX, posY - nodeDistanceY);

            /* Create the edge connecting the node at the top of the page to the original node */
            const lambdaVariableSupportEdgeID = checkID(variableID + " in " + parent + "_edge_from_top_to_variable", edges);
            array = defineEdge(array, lambdaVariableSupportEdgeID, varEdge, classes, lambdaVariableSupportNodeID, newNodeID);

            /* If a free variable node hasn't been drawn yet it needs to be */
            var lambdaAbstractionNodeID = "";

            if(!nodes.includes(lambda + variableID + "._abstraction_node_top")){
                if(!nodes.includes(lambda + variableID + ".")){
                    const freeVariableAbstractionID = checkID(lambda + variableID + ".", nodes);
                    array = defineNode(array, freeVariableAbstractionID, absNodeFree, classes, posX, posY - nodeDistanceY, "", 0, "true");
                    lambdaAbstractionNodeID = freeVariableAbstractionID;
                } else {
                    lambdaAbstractionNodeID = lambda + variableID + ".";
                }
            } else {
                lambdaAbstractionNodeID = lambda + variableID + "._abstraction_node_top";
            }

            /* Create the edge connecting the node at the top to the corresponsing abstraction support node */
            const lambdaVariableAbstractionEdgeID = checkID(variableID + " in " + parent + "_curved_edge_from_abstraction_to_variable", edges);
            array = defineEdge(array, lambdaVariableAbstractionEdgeID, varEdgeLabel, classes, lambdaAbstractionNodeID, lambdaVariableSupportNodeID, variableLabel);

            /* Mark the redex to be applied later */
            smartPush(redexList, [lambdaAbstractionNodeID, classes]);

            break;
    }

    if(redexEdge){
        smartPush(redexEdgeIDs, newEdgeID);
    }

    /* Create an edge linking the newest node with its parent */
    array = defineEdge(array, newEdgeID, newEdgeType, classes, newNodeID, parent, newEdgeLabel);

    return array;
    
}

/**
 * Define a node and add it to the array of map elements
 * @param {Object[]} array      - The array of all the map elements.
 * @param {string} id           - The desired node ID.
 * @param {string} type         - The type of this node. 
 * @param {string[]} classes    - The classes of this node.
 * @param {number} posX         - The x coordinate of this node.
 * @param {number} posY         - The y coordinate of this node.
 * @param {string} label        - The label of this node.
 * @param {number} level        - The level of this node.
 * @param {string} free         - If the node is a free variable.
 * @return {Object[]} The updated array of map elements.
 */
function defineNode(array, id, type, classes, posX, posY, label, level, free){

    const node = createNode(id, type, classes, posX, posY, label, level, free);
    array = pushNode(array, node, id);

    return array;
}

/**
 * Define an edge and add it to the array of map elements
 * @param {Object[]} array  - The array of all the map elements.
 * @param {string} id       - The desired edge ID.
 * @param {string} type     - The type of edge.
 * @param {string[]} classes - The classes of this edge 
 * @param {string} source   - The source of this edge.
 * @param {string} target   - The target of this edge.
 * @param {string} label    - The label of this edge.
 * @return {Object[]} The updated array of map elements.
 */
function defineEdge(array, id, type, classes, source, target, label){
    
    const edge = createEdge(id, type, classes, source, target, label);
    array = pushEdge(array, edge, id);

    return array;
}

/**
 * Create a node on the map.
 * @param {string} id       - The id of the node.
 * @param {string} type     - The type of the node.
 * @param {string[]} classes - The classes of the node.
 * @param {number} x        - The x coordinate of the node (optional).
 * @param {number} y        - The y coordinate of the node (optional).
 * @param {string} label    - The label of this node.
 * @param {number} level    - The level of this node.
 * @param {string} free     - If this node is a free variable.
 * @return {Object} The node object.
 */
function createNode(id, type, classes, x, y, label, level, free){
    
    if(x === undefined || y === undefined){
        return { data: { id: id, type: type}};
    }

    if(label === undefined){
        label = "";
    }

    if(level === undefined){
        level = "";
    }

    if(free === undefined){
        free = "false";
    }


    return { group: 'nodes', data: { id: id, type: type, label: label, level: level, free: free}, position: {x: x, y: y}, classes: classes};

}

/**
 * Create an edge on the map.
 * @param {string} id       - The id of the edge.
 * @param {string} type     - The type of the edge.
 * @param {string[]} classes - The classes of the edge.
 * @param {string} source   - The source of the edge.
 * @param {string} target   - The target of the edge.
 * @return {Object} The edge object.
 */
function createEdge(id, type, classes, source, target, label){

    if(label === undefined){
        label = "";
    }

    return { group: 'edges', data: { id: id, source: source, target: target, type: type, label: label}, classes: classes};
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
    smartPush(edgeObjs, edge);

    return array;
}

/**
 * Generate the classes array from an array of redexes.
 * @param {number[]} redexes - The array containing the indices of the redexes.
 * @return {string[]} The classes array corresponding to these redexes.
 */
function betaClasses(redexes){

    var classes = [];

    for(var i = 0; i < redexes.length; i++){
        classes[i] = "beta-" + redexes[i];
    }

    return classes;
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
 * Update a particular part of the style of the map
 * @param {string} selector - The selector to change the part of the style for. 
 * @param {string} part     - The part of the style to change.
 * @param {string} style    - The style to change the part to.
 */
function updateStyle(map, selector, part, style){
    if(map){
        cyMap.style().selector(selector).style({[part] : style}).update();
    } else {
        cyNorm.style().selector(selector).style({[part] : style}).update();
    }
}

/**
 * Update the node labels of a specific type
 * @param type  - The type of node to change the labels of.
 * @param label - The label to change the nodes to
 */
function updateNodeLabels(type, label){
    updateStyle(true, 'node[type = \"' + type + '\"]', 'label', label);
}

/**
 * Update the edge labels of a specific type
 * @param type  - The type of edge to change the labels of.
 * @param label - The label to change the nodes to
 */
function updateEdgeLabels(type, label){
    updateStyle(true, 'edge[type = \"' + type + '\"]', 'label', label);
}

/**
 * Update the labels on the map
 * @param {boolean} labels - Whether labels are shown
 */
function updateLabels(labels){

    if(labels){
        
        updateNodeLabels(absNode, lambda);
        updateNodeLabels(absNodeFree, lambda);
        updateNodeLabels(appNode, '@');
        updateEdgeLabels(absEdge, 'data(label)');
        updateEdgeLabels(varEdgeLabel, function(ele){
            return ele.data().label;
        });

        updateEdgeLabels(appEdge, function(ele){
        
            var re = /\[(.+)\]/;

            var id = ele.data().id;
            id = id.match(re)[1];
            var terms = id.split(" @ ");

            if(terms[0].substring(0,1) === lambda){
                terms[0] = "(" + terms[0] + ")";
            }

            if(terms[1].substring(0,1) === lambda){
                terms[1] = "(" + terms[1] + ")";
            } else if(terms[1].split(" ").length > 1){
                terms[1] = "(" + terms[1] + ")";
            }

            return terms[0] + " " + terms[1];

        });

    } else {
        updateStyle(true, 'node', 'label', "");
        updateStyle(true, 'edge', 'label', "");
    }
}

/**
 * Place free variables in a pretty way to the right of the map.
 * @param {Object[]} boundVariables - The bound variables in the map.
 * @param {Object[]} freeVariables  - The free variables in the map.
 * @param {Object[]} ctx            - The context of the map (for positioning free variables in order of abstraction)
 */
function placeFreeVariables(boundVariables, freeVariables, ctx){

    var rightest = 0;

    for(i = 0; i < boundVariables.length; i++){
        
        var newX = boundVariables[i].position('x');

        if(newX > rightest){
            rightest = newX;
        }

    }

    for(j = 0; j < freeVariables.length; j++){

        var id = freeVariables[j].data('id');
        var k = ctx.find(id.substring(1).substring(0, id.length - 2));

        freeVariables[j].position('x', rightest + (k + 1) * nodeDistanceX * 2);

    }

    for(l = 0; l < ctx.length(); l++){

        var free = ctx.get(l);
        var varID = lambda + free + ".";

        if(!nodes.includes(varID)){
            cy.add(defineNode([], varID, absNodeFree, "", rightest + (ctx.find(free) + 1) * nodeDistanceX * 2, 0)[0]);
        }
    }

}

/**
 * Get the text to use in a selector for a type.
 * @param {string} type - The type to select.
 */
function getTypeText(type){
    return '[type = \"' + type + '\"]';
}

/**
 * Get the text to use in a selector for nodes of a given type
 * @param {string} type - The type of node to select. 
 */
function getNodeTypeText(type){
    return 'node' + getTypeText(type);
}

/**
 * Draw a graph representing a lambda term into the graph box.
 * @param {string} id       - The id of the graph box.
 * @param {Object} term     - The term to draw as a graph.
 * @param {string[]} ctx    - The context of the term, containing all free variables.
 * @param {boolean} zoom    - Whether zooming is enabled.
 * @param {boolean} pan     - Whether panning is enabled.
 * @param {boolean} labels  - Whether labels should be displayed.
 * @return {Object[]} - The array of elements in this graph, for future use.
 */
function drawMap(id, term, ctx, zoom, pan, labels){

    reset(true);

    elems = generateMapElements(term, ctx);

    cyMap = cytoscape({
        container: document.getElementById(id),

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
                selector: 'node[type =\"' + varNode + '\"], node[type =\"' + varNodeTop + '\"]',
                style: {
                    'width': '5',
                    'height': '5',
                    'background-color': '#ccc',
                    'shape': 'roundrectangle',
                    'color': 'black'
                }
            },

            {
                selector: 'node[type =\"' + absNodeFree + '\"]',
                style: {
                    'background-color': 'red'
                }
            },

            {
                selector: 'edge',
                style: {
                'width': 2,
                'line-color': '#ccc',
                'mid-target-arrow-color': '#ccc',
                'mid-target-arrow-shape': 'triangle',
                'arrow-scale': '1',
                'font-size': '6',
                }
            },

            {
                selector: 'edge[type = \"' + varEdgeLabel + '\"]',
                style: {
                    'curve-style': 'unbundled-bezier',
                    'control-point-distances': function(ele){
                        
                        var source = ele.source();
                        var target = ele.target();

                        var diff = source.position('x') - target.position('x');

                        return diff / 2;

                    },
                    'control-point-weights': '0.5',
                    'loop-direction': '45deg',
                    'edge-distances': 'node-position'
                    
                }
            },

            {
                selector: '.redex',
                style: {
                    'background-color': 'green',
                    'line-color': 'green',
                    'mid-target-arrow-color': 'green'
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
        },

        userZoomingEnabled: zoom,
        userPanningEnabled: pan,
    });

    style = cyMap.style();
    const nodes = cyMap.elements("node");
    var highest = 0;

    for(var i = 0; i < nodes.length; i++){
        
        const y = nodes[i].position('y');

        if(y < highest){
            highest = y;
        }
    }

    placeFreeVariables(cyMap.elements(getNodeTypeText(varNodeTop)), cyMap.elements(getNodeTypeText(absNodeFree)), ctx);

    cyMap.elements(getNodeTypeText(varNodeTop) + ', ' + getNodeTypeText(absNodeFree)).position('y', highest - nodeDistanceY / 2);
    cyMap.fit(cyMap.filter(function(ele, i, eles){return true;}), 10);

    for(var i = 0; i < redexList.length; i++){

        var abstractionNodeTop = cyMap.$id(redexList[i][0]);
        cyMap.$id(redexList[i][0]).addClass(redexList[i][1]);

        if(abstractionNodeTop.data('free') !== 'true'){

            var edgeFromAbstractionToTop = cyMap.elements('edge[target="' + redexList[i][0] + '"]');
            var abstractionNodeRight = edgeFromAbstractionToTop.source();
            var edgeFromAbstractionRight = cyMap.elements('edge[target="' + abstractionNodeRight.id() + '"]');
            var abstractionNode = edgeFromAbstractionRight.source();
        

            cyMap.elements('edge[target="' + redexList[i][0] + '"]').addClass(redexList[i][1]);
            edgeFromAbstractionToTop.source().addClass(redexList[i][1]);
            cyMap.elements('edge[target="' + abstractionNodeRight.id() + '"]').addClass(redexList[i][1]);
            edgeFromAbstractionRight.source().addClass(redexList[i][1]);
        }

    }   

    updateLabels(labels);

    return cyMap;

}

/**
 * Check to make sure that a reduction does not already exist in the graph (e.g. alpha-equivalence)
 * @param {string} id - The id of the reduction (in de Bruijn notation).
 * @param {string} source - The source of the reduction.
 * @param {string} target - The target of the reduction.
 * @return {boolean} Whether the reduction exists.
 */
function checkForIdenticalReduction(id, source, target){

    for(var i = 0; i < edgeObjs.length; i++){

        if(edgeObjs[i].data.id === id && edgeObjs[i].data.source === source && edgeObjs[i].data.target === target){
            return true;
        }
    }

    return false;

}

/**
 * Perform adjustments on a map to ready it for being the child of a normalisation node.
 * @param {Object[]} termElems - The elements generated for the map of the term.
 * @param {string} nodeID - The node that this map belongs to.
 * @return {Object []} The terms adjusted for prettiness.
 */
function setupNormalisationNode(termElems, nodeID){
    var highest = 0;

    for(var i = 0; i < termElems.length; i++){
        
        if(termElems[i].group === "nodes"){
        
            /* Make this node a child of the normalisation node */
            termElems[i].data.parent = nodeID;

            const y = termElems[i].position.y;

            if(y < highest){
                highest = y;
            }

        }

        /* Associate elements with this node to avoid id clashes later */
        termElems[i].data.id += "_child_of_" + nodeID;

        /* Make sure the source and target point to the new ids */
        if(termElems[i].group === "edges"){
            termElems[i].data.source += "_child_of_" + nodeID;
            termElems[i].data.target += "_child_of_" + nodeID;
        }
    }

    /* Extend all variable paths to the top to avoid unnecessary crossings */
    for(var i = 0; i < termElems.length; i++){
        if(termElems[i].data.type === varNodeTop || termElems[i].data.type === absNodeFree){
            termElems[i].position.y = highest - nodeDistanceY / 2;
        }
    }

    return termElems;
}

/**
 * Generate the elements of the normalisation graph.
 * @param {string} id - The id of where the graph will be drawn.
 * @param {Object} tree - The normalisation tree object.
 * @param {Object} ctx - The context of the lambda term.
 * @param {string} parent - The node ID of the parent.
 * @param {string} parentReduction - The reduction that led to this term.
 * @param {number} level - The current level of the graph.
 * @return {Object[]} The graph elements.
 */
function generateNormalisationGraphElements(id, tree, ctx, parent, parentReduction, level){

    var array = [];
    
    if(level === undefined){
        originalTerm = cyMap;
        level = 0;
    }

    /* Nodes use de Bruijn notation to ensure only distinct ones are created (i.e. not alpha-equivalent) */
    var nodeID = tree.term.prettyPrint();
    tree.term.generatePrettyVariableNames(ctx);

    var map = drawMap(id, tree.term, ctx);
    smartPush(imgs, [tree.term.prettyPrint(), map.png()]);

    //array = array.concat(termElems);

    /* Define the node */
    array = defineNode(array, nodeID, "norm", "", 0, level * normalisationDistanceY, tree.term.prettyPrintLabels(), level, "", png);  

    /* Generate the elements for the various branches from this node */
    for(var i = 0; i < tree.reductions.length; i++){
        array = array.concat(generateNormalisationGraphElements(id, tree.reductions[i][0], ctx, nodeID, tree.reductions[i][1].prettyPrintLabels(), level + 1));
    }

    /* Only define edges that represent distinct reductions (i.e. not alpha-equivalent) */
    if(parent !== undefined && !checkForIdenticalReduction(parentReduction, parent, nodeID)){
        array = defineEdge(array, checkID(parentReduction, edges), "norm", "", parent, nodeID, parentReduction);
    }

    cyMap = originalTerm;

    return array;

}

/**
 * Highlight elements of a certain class a certain colour.
 * @param {string} className = The class name to affect.
 * @param {string} colour - The colour to change to. 
 */
function highlightClass(className, colour){

    className = '.' + className;

    if(colour === undefined){
        updateStyle(true, className, 'line-color', '#ccc');
        updateStyle(true, className, 'mid-target-arrow-color', '#ccc');
        updateStyle(true, 'node', 'background-color', '#666');
        updateStyle(true, 'node[type =\"' + varNode + '\"], node[type =\"' + varNodeTop + '\"]', '#ccc');
        updateStyle(true, '.global', 'background=color', '#f00');
    } else {
        updateStyle(true, className, 'background-color', colour);
        updateStyle(true, className, 'line-color', colour);
        updateStyle(true, className, 'mid-target-arrow-color', colour);
    }
}

/**
 * Draw the normalisation graph for a given term.
 * @param {string} id - The id of the graph box.
 * @param {Object} term - The term to draw the normalisation graph of.
 * @param {Object[]} ctx - The free variables in the term.
 */
function drawNormalisationGraph(id, term, ctx){

    reset(false);
    imgs = [];

    var tree = generateReductionTree(term);
    var elems = generateNormalisationGraphElements(id, tree, ctx);

    cyNorm = cytoscape({
        container: document.getElementById(id),

        elements: elems,
    
        style: [
            {
                selector: 'node',
                style: {
                    'color': 'black',
                    'width': '1700',
                    'height': '1200',
                    'font-size': '100',
                    'label': "",
                    'shape': 'rectangle',
                    'background-color': 'white',
                    'border-width': '5',
                    'label': 'data(label)',
                    'text-valign': 'bottom',
                    'font-size': '200'
                }
            },

            {
                selector: 'node[type="norm"]',
                style: {
                   

                }
            },

            {
                selector: 'edge',
                style: {
                'source-arrow-color': '#ccc',
                'source-arrow-shape': 'triangle',
                'arrow-scale': '1.5',
                'line-color': '#ccc',
                'width': '30'
                }
            },

        ],

        layout: {
            name: 'preset'
        },
    })

    
    for(var i = 0; i < imgs.length; i++){
        updateStyle(false, "[id='" + imgs[i][0] + "']", 'background-image', imgs[i][1]);
    }

    var x = normalisationDistanceX;
    var w = normalisationNodeWidth;

    for(var i = 0; i < tree.height() + 1; i++){
        
        var elems = cyNorm.elements('node[level = ' + i + ']');

        var c = Math.floor(elems.length / 2);

        for(var j = 0; j < elems.length; j++){

            var posX = 0;
            
            if(elems.length % 2 === 0){
                posX = (0.5) * x + ((j-c) * (w+x)); 
            } else {
                posX = (-0.5) * w + ((j-c) * (w+x));
            }

            elems[j].position('x', posX);
            elems[j].position('y', i * normalisationDistanceY);
        }
        
    }

    cyNorm.fit(cyNorm.filter(function(ele, i, eles){return true;}), 10);

}