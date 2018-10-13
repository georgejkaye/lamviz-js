function convertToElems(term, array, env){

    switch(term.getType()){
        case ABS:
            var lambdaNode = { data: { id: "\\" }};

    }

}

/**
 * Draw a graph representing a lambda term into the graph box
 */
function drawGraph(term){

  var elems = convertToElems(term, new LambdaEnvironment());
  
  var cy = cytoscape({
      container: document.getElementById("cy"),

      elements: [ // list of graph elements to start with
          { // node a
            data: { id: 'a' }
          },
          { // node b
            data: { id: 'b' }
          },
          {
            data: { id: 'c' }
          },
          { // edge ab
            data: { id: 'ab', source: 'a', target: 'b' }
          }
        ],
      
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
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle'
            }
          }
        ],
      
        layout: {
          name: 'grid',
          rows: 1
        }

  });
}