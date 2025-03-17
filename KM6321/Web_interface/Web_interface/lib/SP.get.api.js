(function(){ 
  document.addEventListener('DOMContentLoaded', function(){

    /** Utility functions **/
    let $ = selector => document.querySelector( selector );  // to select HTML elements
    /* Control size of display canvas. And resize when browser window change size */	
	let resizeCanvas = () => {    // get current browser window size, and fit canvas size to it
	  let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
      let h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      let canvasHeight = '400px'  // minimum height
      let canvasWidth = '600px'   // minimum width
	  let cyHeight = '360px'
	  if  (h > 400) {canvasHeight = h + 'px'; cyHeight = (h-60) + 'px'}
	  if  (w-160 > 600) {canvasWidth = (w-262) + 'px' }
	  $('#canvasWithMenu').style.height = canvasHeight
	  $('#canvasWithMenu').style.width = canvasWidth
	  $('#canvas-menu').style.width = canvasWidth
	  $('#cy').style.height = cyHeight
	  $('#cy').style.width = canvasWidth
	}
	resizeCanvas()   // set initial canvas size
    window.addEventListener("resize", resizeCanvas)   // adjust canvas size when browser window is resized
	
    // Adjust canvas width when entering or exiting fullscreen mode
    let fullscreen_resize = () => { 
	  if (document.fullscreenElement) {   // in fullscreen mode 
	    $('#canvasWithMenu').style.width = '100%'
	    $('#canvas-menu').style.width = '100%'
	    $('#cy').style.width = '100%'
      } else resizeCanvas()   // else if exiting fullscreen mode
	}
    // add event listeners for various web browsers
    document.addEventListener('fullscreenchange', fullscreen_resize)
    document.addEventListener('mozfullscreenchange', fullscreen_resize)  // for firefox
    document.addEventListener('webkitfullscreenchange', fullscreen_resize)  // for Chrome, Safari and Opera
    document.addEventListener('msfullscreenchange', fullscreen_resize)  // for IE, MS Edge

    let cy;  // cytoscape display canvas

    // Close graph popup info box, when user double-clicks on it
    $("#graph-popup1-close").addEventListener('click', function() { $("#graph-popup1").style.display = "none" });
    $("#graph-popup1").addEventListener('dblclick', function() { $("#graph-popup1").style.display = "none" });



    /** Make the popup info box draggable **/
 	
	dragElement(document.getElementById("graph-popup1"), document.getElementById("graph-popup1-pin") );

    // Alternatively, if user erroneously clicks on the pin icon in help msg, click on the correct pin for user
    $('#graph-popup1-pin2').addEventListener('click', function() { $('#graph-popup1-pin').click() })

    function dragElement(elmnt, pinElmnt) {

      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      elmnt.onmousedown = dragMouseDown;
      elmnt.ontouchstart = dragMouseDown;  // for touch screens

      // The pin element toggles the draggable function on and off 
      pinElmnt.onclick = toggle;
	  // pinElmnt.ontouchstart = toggle;
	  
	  function toggle () {
        $('#graph-popup1-pin').classList.toggle("pin-push") 
		if (elmnt.onmousedown != null) { elmnt.onmousedown = null; elmnt.ontouchstart == null }	  
	    else {
          elmnt.onmousedown = dragMouseDown;
          elmnt.ontouchstart = dragMouseDown;  // for touch screens					
		}  
	  }

      function dragMouseDown(e) {
        e = e || window.event;
        // e.preventDefault();
		
		if ((e.clientX)&&(e.clientY)) {
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          // call a function whenever the cursor moves:
          document.onmousemove = elementDrag_mouse;

        } else if (e.targetTouches) {
          pos3 = e.targetTouches[0].clientX;
          pos4 = e.targetTouches[0].clientY;
		  document.ontouchend = closeDragElement;
          // call a function whenever the cursor moves:
          document.ontouchmove = elementDrag_touch;
        }
      }

      function elementDrag_mouse(e) {
        e = e || window.event;
        // e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }

      function elementDrag_touch(e) {
        e = e || window.event;
        // e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.targetTouches[0].clientX;
        pos2 = pos4 - e.targetTouches[0].clientY;
        pos3 = e.targetTouches[0].clientX;
        pos4 = e.targetTouches[0].clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }

      function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
		document.ontouchend = null;
        document.ontouchmove = null;
      }
    }


    /** Script for collapsible menu on left panel **/
    let acc = document.getElementsByClassName("accordion")
    let i;
    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");

        /* Toggle between hiding and showing the active panel */
        let panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      })
    }

 
    
  /** Listeners & Actions attached to HTML elements **/
  

  // Retrieve selected Pioneer with selected relationships (in checkbox)
  $('#checkbox_submit').addEventListener('click', function() { 
    const relation_list = [];   // including biography_of
    if ($('#attribute1').value){relation_list.push($('#attribute1').value)}
    if ($('#min_attribute1').value){relation_list.push($('#min_attribute1').value)}
    if ($('#max_attribute1').value){relation_list.push($('#max_attribute1').value)}
    if ($('#attribute2').value){relation_list.push($('#attribute2').value)}
    if ($('#min_attribute2').value){relation_list.push($('#min_attribute2').value)}
    if ($('#max_attribute2').value){relation_list.push($('#max_attribute2').value)}
    retrieve('_', relation_list, 'TopSongsFilter', 'query');  

  });



  $('#Pioneer').addEventListener('change', function() { 
    retrieve($('#Pioneer').value, '_', 'PotentialPartnershipFinder', 'query');  
  });
    
  // Entity buttons
  // Group 1
  $('#collaborations').addEventListener('click', function() { 
    retrieve('_', '_', 'ArtistCollaborationAnalysis', 'query');  
  });



  


  /** Retrieve list of SingPioneers & construct drop-down menu on left panel **/
  // create a session for neo4j driver
  /* For later
  const session_init = driver.session({ defaultAccessMode: neo4j.session.READ })
  try {
    const result = await session_init.readTransaction(tx =>
      tx.run(
        //  'MATCH (n:MusicalWork) RETURN n.id'
        queryText, { param: parameter }
      )
    )
    // console.log(result.records);
    // construct drop-down menu
    let menu_txt = '<option value="Zubir_Said">Select SingPioneer</option>'
    for (x in result.records) {
       menu_txt += `<option value="${result.records[x]._fields[0].properties.id}">${result.records[x]._fields[0].properties.label}</option>`
    }
    // Display drop-down menu
    document.getElementById("music").innerHTML = menu_txt;
    // document.getElementById("letters").innerHTML = menu_txt;
    // document.getElementById("commentary").innerHTML = menu_txt;
  } catch (error) {
    console.log(`unable to execute initial query for dropdown list: ${error}`)
  } finally {
    session_init.close()
  }
   */


 
  /** MAIN FUNCTION **/ 
  // Fetch function submits query to ZS server API (middleware) using POST method, and retrieves json result
  // Display query parameter in element ID 'query'
  // Runs cytoscape visualization     **/
  
  async function retrieve(parameter1, parameter2, queryID, elementID_query) {
    // Display TOPIC (query keyword) as page header
    document.getElementById(elementID_query).innerHTML = parameter1.replace(/_/g, ' ')
    API_domain = 'https://km6321-453214.as.r.appspot.com'
	 //API_domain = 'http://localhost:8080'  // for testing on laptop
    API_router = 'SPget'
	  API_queryID = queryID
    API_param1 = encodeURIComponent(parameter1)
    API_param2 = encodeURIComponent(parameter2)
    API_string = `${API_domain}/${API_router}/${API_queryID}/${API_param1}/${API_param2}`
    // example API_string: https://???.as.r.appspot.com/SPget/0/Zubir_Said/_
    fetch(API_string)   // FETCH FROM API
      .then(response => { if (!response.ok) {throw new Error("Server API didn't respond")}
                          return response.json()
	   })
      .then(json_value => { 
        if (json_value.length == 0) {	 
          document.getElementById(elementID_query).innerHTML = document.getElementById(elementID_query).innerHTML + '<br/><span style="color: hsl(330, 100%, 50%); text-shadow: none">NO MATCH FOUND</span>'
        }else if(json_value[0].keys.includes('Name')){
          json3graph(json_value)
        }else if (json_value[0]._fields.length == 2) {
        jsonPath2graph(API_param1,json_value)
        } else { 
          json2graph(json_value)    
        }
        if (queryID === 'keyword') { 
           cy.nodes('*').unlock()   // unlock all nodes
	       cy.layout( layouts['concentric'] ).run()
        } else if (queryID === '0') {  
           // don't unlock nodes
	       cy.layout( layouts['cola'] ).run()    // run default graph layout
        } else {   
           cy.nodes('*').unlock()   // unlock all nodes
	       cy.layout( layouts['fcose'] ).run()   // run fcose for initial layout, then cola for adjustment
           cy.reset()
	       cy.layout( layouts['cola'] ).run()    // run default graph layout
	    }
	   })
      .catch(error => {console.error('Problem with the fetch operation from server API', error) })
  }


  /** 2nd version of retrieve2 function to display result in table1 element **/
  async function retrieve2(parameter1, parameter2, queryID, elementID_query) {

    // Display TOPIC (query keyword) as page header
    document.getElementById(elementID_query).innerHTML = 'Result table: ' + parameter1.replace(/_/g, ' ')
    $("#table1").innerHTML = 'Retrieving result ... may take 15 sec. <br/> <br/> <br/> <br/> <br/> <br/>';

    API_domain = 'https://km6321-453214.as.r.appspot.com'
	//API_domain = 'http://localhost:8080'  // For testing on laptop
	
    API_router = 'SPget'
	API_queryID = queryID
    API_param1 = encodeURIComponent(parameter1)
    API_param2 = encodeURIComponent(parameter2)
    API_string = `${API_domain}/${API_router}/${API_queryID}/${API_param1}/${API_param2}`


    fetch(API_string)
      .then(response => { if (!response.ok) {throw new Error("Server API didn't respond")}
                          return response.json()
	   })
      .then(json_value => { 
	    // console.log(json_value);
	    // Create table display
        let txt = "<table style='border-spacing: 2px;'><tr>"
	  
	    // Creater table header
	    for (y in json_value[0].keys) {  // Process each field in record
		      txt += "<th style='background-color:hsl(0,20%,80%)'>" + json_value[0].keys[y] + "</th>"  
	    }
	    txt += "</tr>"  // close header row
		  
        // display records in table rows
        for (x in json_value) {
          txt += "<tr>"   // open the table row		  
		  for (y in json_value[x]._fields) {  // Process each field in record
		      txt += "<td>" + json_value[x]._fields[y] + "</td>"  
		  }
		  txt += "</tr>"  // close the table row
        }
        txt += "</table>" 

        // Display table in result element
        $("#table1").innerHTML = txt;
		
	   })
      .catch(error => {console.error('Problem with the fetch operation from server API', error) })

  }



  /** Carry out keyword search in node labels */
  async function searchNode (keyword, dropdownList) {  // dropdownList is either entityA or entityB

    API_domain = 'https://km6321-453214.as.r.appspot.com'
	//API_domain = 'http://localhost:8080'  // for testing on laptop

    API_router = 'SPget'
    API_queryID = 'searchKeyword'
    API_param1 = '_'
    API_param2 = encodeURIComponent(keyword)
    API_string = `${API_domain}/${API_router}/${API_queryID}/${API_param1}/${API_param2}`


    fetch(API_string)
      .then(response => { if (!response.ok) {throw new Error("Server API didn't respond")}
                          return response.json()
	   })
      .then(json_value => { 
	    // console.log(json_value);	
        // construct drop-down menu
        let menu_txt = '<option value="">Select</option>'
        for (x in json_value) {
           menu_txt += `<option value="${json_value[x]._fields[0].properties.id}">${json_value[x]._fields[0].properties.label}</option>`
        }
        // Display drop-down menu
        document.getElementById(dropdownList).innerHTML = menu_txt;
		
	   })
      .catch(error => {console.error('Problem with the fetch operation from server API', error) })

  }
  
  /** Add Neo4j result records to Cytoscape graph */
  let json2graph = records => {
    cy.elements().remove()
    records.forEach(record => {
      // 根据 _fieldLookup 或者已知顺序提取字段
      let artist1 = record._fields[record._fieldLookup['Artist1']];
      let artist2 = record._fields[record._fieldLookup['Artist2']];
      let collaborationCountObj = record._fields[record._fieldLookup['collaboration_count']];
      let songs = record._fields[record._fieldLookup['songs']];
      let r=record._fields[record._fieldLookup['r']];
      // 如果 Neo4j 返回的是 Neo4j integer 对象，则转换成普通数字
      // 如果 Neo4j 返回的是 Neo4j integer 对象，则转换成普通数字
      console.log(collaborationCountObj)
      let collaborationCount = (typeof collaborationCountObj.low !== 'undefined')
                                  ? collaborationCountObj.low 
                                  : collaborationCountObj;
      // 如果节点不存在，则添加 Artist1 节点
      if (cy.$id(artist1).empty()) {
        cy.add({ data: { id: artist1, label: artist1, type: 'Artist' } });
        if (!nodeTypeRegistry.includes('Artist')) {
          nodeTypeRegistry.push('Artist');
        }
      }
      // 同理，添加 Artist2 节点
      if (cy.$id(artist2).empty()) {
        cy.add({ data: { id: artist2, label: artist2, type: 'Artist' } });
        if (!nodeTypeRegistry.includes('Artist')) {
          nodeTypeRegistry.push('Artist');
        }
      }
      
      // 构造边的 id，这里用 "Artist1-Artist2" 作为示例（需要确保唯一性）
      let edgeId = artist1 + '-' + artist2;
      if (cy.$id(edgeId).empty()) {
        cy.add({ data: {
            id: edgeId,
            source: artist1,
            target: artist2,
            collaboration_count: collaborationCount,
            songs: songs,
            type: 'collaboration',
            label: `${r.type}`
        }});
        if (!edgeTypeRegistry.includes('collaboration')) {
          edgeTypeRegistry.push('collaboration');
        }
      }
    });
  };
  
  let json3graph=records => {
    cy.elements().remove()
    if (!node_edge_removed.empty()) node_edge_removed.restore();

    records.forEach(record => {
        let songName = record._fields[record._fieldLookup["Name"]]; // 歌名
        let artists = record._fields[record._fieldLookup["Artists"]]; // 艺术家列表
        let streamCount = record._fields[record._fieldLookup["Stream"]]; // 播放量
        let attr1Obj = record._fields[record._fieldLookup["Attribute1Value"]]; // 属性1
        let attr2Obj = record._fields[record._fieldLookup["Attribute2Value"]]; // 属性2

        let attr1 = (typeof attr1Obj.low !== 'undefined') ? attr1Obj.low : attr1Obj;
        let attr2 = (typeof attr2Obj.low !== 'undefined') ? attr2Obj.low : attr2Obj;

        // 添加歌曲节点（如果不存在）
        if (cy.$id(songName).empty()) {
            cy.add({
                data: {
                    id: songName,
                    label: songName,
                    type: "Song",
                    stream: streamCount,
                    attr1: attr1,
                    attr2: attr2,
                }
            });

            if (!nodeTypeRegistry.includes("Song")) {
                nodeTypeRegistry.push("Song");
            }
        }

        // 遍历所有艺术家
        artists.forEach(artist => {
            // 添加艺术家节点（如果不存在）
            if (cy.$id(artist).empty()) {
                cy.add({
                    data: {
                        id: artist,
                        label: artist,
                        type: "Artist"
                    }
                });

                if (!nodeTypeRegistry.includes("Artist")) {
                    nodeTypeRegistry.push("Artist");
                }
            }

            // 添加边（如果不存在）
            let edgeId = artist + "-" + songName;
            if (cy.$id(edgeId).empty()) {
                cy.add({
                    data: {
                        id: edgeId,
                        source: artist,
                        target: songName,
                        type: "Performs",
                        stream: streamCount, // 用播放量作为边的属性
                        label: `${streamCount}`
                    }
                });

                if (!edgeTypeRegistry.includes("Performed")) {
                    edgeTypeRegistry.push("Performed");
                }
            }
        });
    });

    // 生成筛选控件（如果有工具函数）
    toolboxFilter_createCheckboxes(nodeTypeRegistry, edgeTypeRegistry);
    
  };
  
  /** For Neo4j result in the form of paths       */
  /** Add Neo4j result records to Cytoscape graph */
  let jsonPath2graph = (targetArtist ,records) => {
    cy.elements().remove()
    targetArtist=decodeURIComponent(targetArtist)
    // 先恢复删除的节点和边（如果有这部分逻辑）
    if (!node_edge_removed.empty()) node_edge_removed.restore();
    // 确保目标歌手节点存在
    if (cy.$id(targetArtist).empty()) {
      cy.add({ 
        data: { 
          id: targetArtist, 
          label: targetArtist, 
          type: 'Artist' 
        }
      });
      if (!nodeTypeRegistry.includes('Artist')) {
        nodeTypeRegistry.push('Artist');
      }
    }
    // 遍历所有查询结果，每个 record 表示一条潜在合作关系
    records.forEach(record => {
      // 从 _fieldLookup 中获取字段索引
      let potential = record._fields[ record._fieldLookup['potential_collaborator'] ];
      let pathLengthObj = record._fields[ record._fieldLookup['path_length'] ];
      // 如果返回的是 Neo4j 整数对象，转换成普通数字
      let pathLength = (typeof pathLengthObj.low !== 'undefined') ? pathLengthObj.low : pathLengthObj;
      // 添加潜在合作伙伴节点（如果不存在）
      if (cy.$id(potential).empty()) {
        cy.add({
          data: {
            id: potential,
            label: potential,
            type: 'Artist'
          }
        });
        if (!nodeTypeRegistry.includes('Artist')) {
          nodeTypeRegistry.push('Artist');
        }
      }
      // 构造边的 id，使用目标歌手和潜在合作伙伴拼接（确保唯一性）
      let edgeId = targetArtist + '-' + potential;
      if (cy.$id(edgeId).empty()) {
        cy.add({
          data: {
            id: edgeId,
            source: targetArtist,
            target: potential,
            path_length: pathLength,
            type: 'potential_collaboration',
            label: `${pathLength}`
          }
        });
        if (!edgeTypeRegistry.includes('potential_collaboration')) {
          edgeTypeRegistry.push('potential_collaboration');
        }
      }
    });

    // 后续可以调用工具函数更新过滤控件和调试信息（可选）
    toolboxFilter_createCheckboxes(nodeTypeRegistry, edgeTypeRegistry);
  }
 
 
 
  cy = cytoscape({   // Create cytoscape object. Original method, without creating function
  // let create_cytoscape = () => cytoscape({      // a function to create cytoscape object. The clear_canvas function destroys the current cytoscape object. This function is used to re-create cytoscape object
    
	container: $('#cy'),
	minZoom: 0.5,
    maxZoom: 4,
	
    elements: [ // list of graph elements to start with
    ],

    style: [ // the stylesheet for the graph
      {
        selector : "node",
        style : {
		  "label" : "data(label)",
		  "text-wrap" : "wrap",
		  "text-max-width" : "180px",
          "background-color" : "hsl(240,80%,90%)",
          "border-width" : 0.0,
          "height" : 30.0,
          "shape" : "ellipse",
          "font-size" : 12,
          "color" : "hsl(240,80%,20%)",
          "text-opacity" : 1.0,
          "text-valign" : "center",
          "text-halign" : "center",
          "font-family" : "Tahoma, Arial, sans-serif",
          "font-weight" : "normal",
          "border-opacity" : 0.0,
          "border-color" : "hsl(0,0%,100%)",
          "width" : 50.0,
          "background-opacity" : 1.0,
          "content" : "data(label)"
      }}, 
	  {
        selector : "edge",
        style : {
		  "label" : "data(label)",
		  "text-wrap" : "wrap",
		  "text-max-width" : "200px",
          "line-style" : "solid",
		  "curve-style" : "bezier",
          "font-size" : 12,
          "color" : "hsl(240,80%,20%)",
          "line-color" : "hsl(240,80%,70%)",
          "text-opacity" : 1.0,
          "width" : 1.0,
          "font-family" : "Tahoma, Arial, sans-serif",
          "font-weight" : "normal",
          "opacity" : 1.0,
		  "source-arrow-color" : "hsl(0,0%,100%)",
          "source-arrow-shape" : "none",
		  "target-arrow-shape" : "vee",
          "target-arrow-color" : "hsl(240, 55%, 65%)",
		  "target-arrow-fill" : "hollow",
		  "arrow-scale" : 1,
          "content" : "data(label)"
      }}, 
	  {
        selector : "node[supertype = 'Person']",
        style : {
          "background-color" : "hsl(80, 80%, 90%)",
	      "shape" : "round-rectangle",
		  "height" : 20.0,
	      "border-width" : 1.0,
          "border-opacity" : 1.0,
          "border-color" : "hsl(80, 80%, 50%)",
          "width" : 80.0,
          "background-opacity" : 1.0,
      }}, 
	  {
        selector : "node[supertype = 'Item']",
        style : {
    	  "background-color" : "hsl(200, 80%, 90%)",
	      "border-width" : 1.0,
          "height" : 20.0,
          "shape" : "ellipse",
          "border-opacity" : 1.0,
          "border-color" : "hsl(200, 50%, 50%)",
          "width" : 20.0,
          "background-opacity" : 1.0,
      }}, 
	  {
        selector : "edge[type = 'REALIZATION'],[type = 'PERFORMED_IN'],[type = 'ARRANGEMENT']",
        style : {
          "line-color" : "hsl(0, 100%, 90%)",
	      "width" : 3.0,
       }}, 
	   {
        selector : "node[supertype = 'Class']",
        style : {
	      "background-color" : "hsl(280, 60%, 90%)",
          "shape" : "triangle",
        }},
	  {
        selector : "node[type = 'SingPioneer']",
        style : {
          "shape" : "round-rectangle",
	      "background-color" : "hsl(0, 80%, 90%)",
	      "height" : 20.0,
		  "width" : 80.0,
		  "border-width" : 1.0,
          "border-opacity" : 1.0,
          "border-color" : "hsl(0, 60%, 70%)",
      }}, 
	  {
        selector : "node:selected",
        style : {
          "background-color" : "hsl(280,100%,70%)"
      }}, 
	  {
        selector : "edge:selected",
        style : {
          "line-color" : "hsl(280,100%,30%)",
      }},
    ],	  
  });
  // cy = create_cytoscape ()   // To use this line if create_cytoscape() function is created


  let layouts = {
    cola: {
        name: 'cola',
		
        animate: true, // whether to show the layout as it's running
        refresh: 1, // number of ticks per frame; higher is faster but more jerky
        maxSimulationTime: 20000, // max length in ms to run the layout
        ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
        fit: false, // on every layout reposition of nodes, fit the viewport
        padding: 30, // padding around the simulation
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

        // layout event callbacks
        ready: function(){}, // on layoutready
        stop: function(){}, // on layoutstop

        // positioning options
        randomize: false, // use random node positions at beginning of layout
        avoidOverlap: true, // if true, prevents overlap of node bounding boxes
        handleDisconnected: true, // if true, avoids disconnected components from overlapping
        convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
        nodeSpacing: function( node ){ return 20; }, // extra spacing around nodes. orig value = 10
        flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
        alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
        gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
        centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)

        // different methods of specifying edge length
        // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
        edgeLength: 150, // sets edge length directly in simulation. orig value=100
        edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
        edgeJaccardLength: undefined, // jaccard edge length in simulation

        // iterations of cola algorithm; uses default values on undefined
        unconstrIter: undefined, // unconstrained initial layout iterations
        userConstIter: undefined, // initial layout iterations with user-specified constraints
        allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
    },
    breadthfirst: {  	
	    name: 'breadthfirst',

        fit: false, // whether to fit the viewport to the graph
        directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
        padding: 30, // padding on fit
        circle: false, // put depths in concentric circles if true, put depths top down if false
        grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
        spacingFactor: 1.5, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap). default 1.75
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
        roots: undefined, // the roots of the trees
        maximal: false, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled,
        animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts

    },
    cose: {		  
        name: 'cose',

        ready: function(){},  // Called on `layoutready`
        stop: function(){},   // Called on `layoutstop`

        // Whether to animate while running the layout
        // true : Animate continuously as the layout is running
        // false : Just show the end result
        // 'end' : Animate with the end result, from the initial positions to the end positions
        animate: true,
        animationEasing: undefined,    // Easing of the animation for animate:'end'
        animationDuration: 10000,  // The duration of the animation for animate:'end'

        // A function that determines whether the node should be animated
        // All nodes animated by default on animate enabled
        // Non-animated nodes are positioned immediately when the layout starts
        animateFilter: function ( node, i ){ return true; },

        // The layout animates only after this many milliseconds for animate:true
        // (prevents flashing on fast runs)
        animationThreshold: 250,

        refresh: 20,    // Number of iterations between consecutive screen positions update
        fit: false,    // Whether to fit the network view after when done
        padding: 30,    // Padding on fit
        boundingBox: undefined,    // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }

        // Excludes the label when calculating node bounding boxes for the layout algorithm
        nodeDimensionsIncludeLabels: false,

        randomize: false,        // Randomize the initial positions of the nodes (true) or use existing positions (false)
        componentSpacing: 40,    // Extra spacing between components in non-compound graphs
        nodeRepulsion: function( node ){ return 2048; },    // Node repulsion (non overlapping) multiplier. Default 2048
        nodeOverlap: 5,          // Node repulsion (overlapping) multiplier. Default 4
        idealEdgeLength: function( edge ){ return 40; },    // Ideal edge (non nested) length
        edgeElasticity: function( edge ){ return 40; },     // Divisor to compute edge forces
        nestingFactor: 1.2,      // Nesting factor (multiplier) to compute ideal edge length for nested edges
        gravity: 1,              // Gravity force (constant)
        numIter: 20000,           // Maximum number of iterations to perform
        initialTemp: 1000,       // Initial temperature (maximum node displacement)
        coolingFactor: 0.99,     // Cooling factor (how the temperature is reduced between consecutive iterations
        minTemp: 1.0             // Lower temperature threshold (below this point the layout will end)
    }, 
	concentric: {
      name: 'concentric',

      fit: false, // whether to fit the viewport to the graph
      padding: 30, // the padding on fit
      startAngle: 3 / 2 * Math.PI, // where nodes start in radians
      sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
      clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
      equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
      minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
      height: undefined, // height of layout area (overrides container height)
      width: undefined, // width of layout area (overrides container width)
      spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      concentric: function( node ){ // returns numeric value for each node, placing higher nodes in levels towards the centre
        return node.degree();
      },
      levelWidth: function( nodes ){ // the variation of concentric values in each level
        return nodes.maxDegree() / 4;
      },
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
    },
	fcose: {
      name: 'fcose',
	
      // 'draft', 'default' or 'proof' 
      // - "draft" only applies spectral layout 
      // - "default" improves the quality with incremental layout (fast cooling rate)
      // - "proof" improves the quality with incremental layout (slow cooling rate) 
      quality: "default",
      // Use random node positions at beginning of layout
      // if this is set to false, then quality option must be "proof"
      randomize: true, 
      // Whether or not to animate the layout
      animate: false,   // true
      // Duration of animation in ms, if enabled
      animationDuration: 1000, 
      // Easing of animation, if enabled
      animationEasing: undefined, 
      // Fit the viewport to the repositioned nodes
      fit: true, 
      // Padding around layout
      padding: 30,
      // Whether to include labels in node dimensions. Valid in "proof" quality
      nodeDimensionsIncludeLabels: false,
      // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
      uniformNodeDimensions: false,
      // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
      packComponents: true,
      // Layout step - all, transformed, enforced, cose - for debug purpose only
      step: "all",
  
      /* spectral layout options */
      // False for random, true for greedy sampling
      samplingType: true,
      // Sample size to construct distance matrix
      sampleSize: 25,
      // Separation amount between nodes
      nodeSeparation: 75,
      // Power iteration tolerance
      piTol: 0.0000001,
  
      /* incremental layout options */
      // Node repulsion (non overlapping) multiplier
      nodeRepulsion: node => 15000,   // default 4500
      // Ideal edge (non nested) length
      idealEdgeLength: edge => 100,   // 50
      // Divisor to compute edge forces
      edgeElasticity: edge => 0.45,
      // Nesting factor (multiplier) to compute ideal edge length for nested edges
      nestingFactor: 0.1,
      // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
      numIter: 2500,
      // For enabling tiling
      tile: true,  
      // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
      tilingPaddingVertical: 10,
      // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
      tilingPaddingHorizontal: 10,
      // Gravity force (constant)
      gravity: 0.25,     // 0.25
      // Gravity range (constant) for compounds
      gravityRangeCompound: 1.5,
      // Gravity force (constant) for compounds
      gravityCompound: 1.0,
      // Gravity range (constant)
      gravityRange: 3.8, 
      // Initial cooling factor for incremental layout  
      initialEnergyOnIncremental: 0.3,

      /* constraint options */
      // Fix desired nodes to predefined positions
      // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
      fixedNodeConstraint: undefined,
      // Align desired nodes in vertical/horizontal direction
      // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
      alignmentConstraint: undefined,
      // Place two nodes relatively in vertical/horizontal direction
      // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
      relativePlacementConstraint: undefined,

      /* layout event callbacks */
      ready: () => {}, // on layoutready
      stop: () => {} // on layoutstop	
	},
	dagre: {
      name: 'dagre',
	  
	  // dagre algo options, uses default value on undefined
      nodeSep: undefined, // the separation between adjacent nodes in the same rank
      edgeSep: undefined, // the separation between adjacent edges in the same rank
      rankSep: undefined, // the separation between each rank in the layout
      rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
      ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
      minLen: function( edge ){ return 1; }, // number of ranks to keep between the source and target of the edge
      edgeWeight: function( edge ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges

      // general layout options
      fit: true, // whether to fit to viewport
      padding: 30, // fit padding
      spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
      animate: false, // whether to transition the node positions
      animateFilter: function( node, i ){ return true; }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      transform: function( node, pos ){ return pos; }, // a function that applies a transform to the final node position
      ready: function(){}, // on layoutready
      stop: function(){} // on layoutstop
    },
	spread: {
      name: 'spread',
	  
      animate: true, // Whether to show the layout as it's running
      ready: undefined, // Callback on layoutready
      stop: undefined, // Callback on layoutstop
      fit: true, // Reset viewport to fit default simulationBounds
      minDist: 20, // Minimum distance between nodes
      padding: 20, // Padding
      expandingFactor: -1.0, // If the network does not satisfy the minDist
      // criterium then it expands the network of this amount
      // If it is set to -1.0 the amount of expansion is automatically
      // calculated based on the minDist, the aspect ratio and the
      // number of nodes
      prelayout: { name: 'fcose' }, // Layout options for the first phase
      maxExpandIterations: 4, // Maximum number of expanding iterations
      boundingBox: undefined, // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      randomize: false // Uses random initial node positions on true	  
    },
  }



  /** Listeners & Actions attached to Cytoscape display & elements **/
  
  /* Change graph layout */
  $('#layout-breadthfirst').addEventListener('click', function(){ cy.nodes('*').unlock(); cy.layout( layouts['breadthfirst'] ).run() });
  $('#layout-fcose').addEventListener('click', function(){ cy.nodes('*').unlock(); cy.layout( layouts['fcose'] ).run() });
  $('#layout-concentric').addEventListener('click', function(){ cy.nodes('*').unlock(); cy.layout( layouts['concentric'] ).run() });
  $('#layout-cola').addEventListener('click', function(){ cy.nodes('*').unlock(); cy.layout( layouts['cola'] ).run() });
  $('#clear_canvas').addEventListener('click', function(){ 
     // cy.destroy(); cy = create_cytoscape(); cy_addListener (cy)  // use this approach if next line (remove() function) fails
	 cy.elements().remove()  // original approach. Unfortunately the remove() method sometimes crashes. Probably a bug in cy library
	 nodeTypeRegistry = []    // for storing all the node types 
     edgeTypeRegistry = []   // for storing all the edge types
     node_edge_removed = cy.collection()  // for storing nodes and edges removed from the graph
     $('#panel-filter-help').innerHTML = 
        `<br/><span style='color: hsl(336, 100%, 30%)'>First, display a graph on the canvas by clicking on buttons on the left panel.<br/>
	    Then a list of node types will display here for selection.</span><br/> <br/>`
     $('#panel-filter-help').style.visibility = 'visible'
     $('#sidepanel1').classList.remove("sidepanel-pin","sidepanel-pin2","transition-delay")  // close sidepanel
     $('#sidepanel-pin2').classList.remove("pin-push")  // reset pin button sidepanel	 
     $('#checkboxes-nodeTypes').innerHTML = '' // remove checkboxes
     $('#checkboxes-edgeTypes').innerHTML = ''
	 $('#checkbox_submit1').style.visibility = 'hidden'
	 $('#checkbox_submit2').style.visibility = 'hidden'
	 $('#checkbox_clear1').style.visibility = 'hidden' 
	 $('#checkbox_clear2').style.visibility = 'hidden'
	 $('#checkbox_reset1').style.visibility = 'hidden'
	 $('#checkbox_reset2').style.visibility = 'hidden'
   });
  $('#zoom-reset').addEventListener('click', function(){ cy.reset();  });
  $('#zoom-plus').addEventListener('click', function(){ cy.zoom(cy.zoom()+0.1) })
  $('#zoom-minus').addEventListener('click', function(){ cy.zoom(cy.zoom()-0.1) })
  $('#layout-spread').addEventListener('click', function(){ cy.nodes('*').unlock(); cy.layout( layouts['spread'] ).run() });
  // $('#resizeCanvas').addEventListener('click', function(){ resizeCanvas(); cy.reset();  });
  $('#fullscreen').addEventListener('click', function(){ openFullscreen(); cy.reset();  });

  function openFullscreen() {
    if ($('#canvasWithMenu').requestFullscreen) {
      $('#canvasWithMenu').requestFullscreen();
    } else if ($('#canvasWithMenu').webkitRequestFullscreen) { /* Safari */
      $('#canvasWithMenu').webkitRequestFullscreen();
    } else if ($('#canvasWithMenu').msRequestFullscreen) { /* IE11 */
      $('#canvasWithMenu').msRequestFullscreen();
    }
  }



let cy_addListener = cy => {    // Create function to attach actions to clicks on graph nodes and edges

  /* Respond to clicks on graph nodes & edges */
  cy.on('tap', 'node', function(event){
    let node = event.target;      // event.target represents the element that was clicked

    // console.log( 'tapped ' + node.data() );
	// $('#graph-popup1-content').innerHTML = '<p>' + JSON.stringify(node.data()) + '</p>';

    // If node is a Parent (Cluster) node, then exit function
	if (node.data()['type'] == 'Cluster') return

    // html text to display in panel. Start with ID2 field
    let txt = '<p><b>ID: ' + node.data()['id2'] + '</b></p>';  
	txt = txt.replace(/_/g, ' ')   // replace _ with space

    // temporary storage
    let comment_text;  
	let link_text;
	let date_text;
	
    for (x in node.data()) {

      // console.log(x + " : " + node.data()[x])
      
       
        //ID: <a target="_blank" href="?parameter='
        //txt += records[x]._fields[y].properties.id  + '">'   // hyperlink
        //txt += records[x]._fields[y].properties.id.replace(/_/g, ' ') + '</a></b><br/>'  // text
     
      switch (x) {          // handle dates & URLs
        case 'id': break;   // skip id field as it is just a node no. We'll display id2
        case 'id2': break;  // already displayed
		case 'supertype': break;  // skip this field
        case 'comment':
          comment_text = node.data()[x]
          comment_text = comment_text.replace(/\\n/g, '<br/>')  // replace \\n in the text with <br>
		  comment_text = comment_text.replace(/\\/g, '')  // remove \ <br>
		  comment_text = comment_text.replace(/[‘’“”]/g, '\'')  // replace pretty quotation marks with plain quote
          txt += '<p><em>comment</em>: ' + comment_text + '</p>'
          break;
        case 'birthDate':
        case 'deathDate':
        case 'date':
          date_text = node.data()[x]
          // date_text = date_text.replace('-1-1$', '')  // remove Jan 1st, and retain just the year.
		  // date_text = date_text.replace('-01-01', '')    	          
          txt += '<p><em>' + x + '</em>: ' + date_text + '</p>'				  
		  break;
        case 'thumbnailURL':  // display thumbnail image
              txt += '<p><a target="_blank" href="' + node.data().accessURL[0]  + '">'
              txt += '<img alt="Photograph" width="200" src="' + node.data().thumbnailURL[0] +'"/></a></p>'
          break;
        case 'accessURL':
          for (link in node.data()[x]) {
              link_URL = node.data().accessURL[link]

                if (link_URL.search("pdf")>=0) { link_text = 'PDF'   // PDF file
                } else if (link_URL.search("jpg")>=0) { link_text = 'JPG' 
                } else if (link_URL.search("youtube")>=0) { link_text = 'YouTube' 
                } else { link_text = 'Webpage' }

                txt += '<p><a href="' + link_URL +'" target="_blank"><b>' + link_text + '</b></a></p>'
          }
          break;
        default: if ( node.data()[x] !== '' ) { txt += '<p><em>' + x + '</em>: ' + node.data()[x] + '</p>' }
      }
    }
	$('#node-expand').value = node.data()['id2'];  // Add neo4j node ID2 to button value - to pass to listener when clicked
	$('#node-remove').value = node.data()['id'];   // Add cytoscape node ID to button value
    $('#graph-popup1-content').innerHTML = txt;
	$('#graph-popup1').style.display = 'block'; 
	$('#graph-popup1-menu').style.display = 'block'; 

  })

  cy.on('tap', 'edge', function(event){
    let edge = event.target;
    let txt = '<p><b>Relation: ' + edge.data()['supertype'] + '</b></p>';  // html text to display in panel
	
    for (x in edge.data()) {
     
      switch (x) {          
        case 'id': break;       // skip 
		case 'source': break;   // skip 
		case 'target': break;   // skip 
        case 'comment':
          comment_text = edge.data()[x]
          comment_text = comment_text.replace(/\\n/g, '<br/>')
		  comment_text = comment_text.replace(/\\/g, '')
		  comment_text = comment_text.replace(/[‘’“”]/g, '\'')		  
          txt += '<p><em>comment</em>: ' + comment_text + '</p>'
          break;
        default: if ( edge.data()[x] !== '' ) { txt += '<p><em>' + x + '</em>: ' + edge.data()[x] + '</p>' }
      }
    }
    $('#graph-popup1-content').innerHTML = txt;
	$('#graph-popup1').style.display = 'block'; 
	$('#graph-popup1-menu').style.display = 'none'; 
  })

  /* Expand a node with neighboring nodes, when user rightclicks on a node */
  cy.on('cxttap', 'node', function(event){
    let node = event.target;      // event.target represents the element that was clicked
	node.select()
	
    // If node is a Parent (Cluster) node, then exit function
	if (node.data()['type'] == 'Cluster') return	

    cy.nodes('*').unlock()   // unlock all nodes
    node.lock()              // lock selected node		
    retrieve(node.data()['id2'],'_', '0','query')
  }) 

  /* Double-click -- currently same as right-click */
  cy.on('dbltap', 'node', function(event){
    let node = event.target      // event.target represents the element that was clicked
	node.select() 

    // If node is a Parent (Cluster) node, then exit function
	if (node.data()['type'] == 'Cluster') return

    cy.nodes('*').unlock()   // unlock all nodes
    node.lock()              // lock selected node		
    retrieve(node.data()['id2'],'_', '0', 'query')
  })  

  /* On mousedown, unlock() the node */
  cy.on('tapstart', 'node', function(event){
    let node = event.target      // event.target represents the element that was clicked
    node.unlock()              // lock selected node	
  })
 
}      // End of function to attach actions to clicks on graph nodes and edges
cy_addListener (cy)   // Run function on current cytoscape graph
 
 
  /* Add listeners for expanding and removing existing Cytoscape nodes */
  // expand node id stored in button value
  $('#node-expand').addEventListener('click', function() { 
    cy.nodes('*').unlock()   // unlock all nodes
    cy.$id($('#node-expand').name).lock()  // lock selected node	
    retrieve( $('#node-expand').value, '_', '0', 'query') // $('#node-expand').value contains the node ID used in neo4j database
  });
  // remove node stored in button value
  $('#node-remove').addEventListener('click', function() { 
    cy.$id($('#node-remove').value).remove()                // $('#node-remove').value contains the node ID used in Cytoscape
  });  


  
  /*** Code for Side Panel & Toolbox functions ***/

  // global variables
  let nodeTypeRegistry = []    // for storing all the node types -- to display in toolbox
  let edgeTypeRegistry = []   // for storing all the edge types
  let node_edge_removed = cy.collection()  // for storing nodes and edges removed from the graph
  acc[4].click()  // in the sidepanel, start with the first accordion panel open
  
  // No longer used: Event listeners for ! and X to pin or close sidepanel
  // $("#sidepanel-close").addEventListener('click', function() { $('#sidepanel1').classList.remove("sidepanel-pin") });
  // $("#sidepanel-pin").addEventListener('click', function() { $('#sidepanel1').classList.add("sidepanel-pin") });

  // pin2 icon is clicked by user
  $("#sidepanel-pin2").addEventListener('click', function() { 
    $('#sidepanel1').classList.toggle("sidepanel-pin2") 
    $('#sidepanel-pin2').classList.toggle("pin-push") 
  }) 


  // Remove pin (but not pin2) when mouseover the panel
  $("#sidepanel1").addEventListener('mouseenter', function() { $('#sidepanel1').classList.remove("sidepanel-pin","transition-delay") })

  // Add transition delay (i.e. delay closing the panel) when mouseleave (alternatively mouseout)
  $("#sidepanel1").addEventListener('mouseleave', function() { $('#sidepanel1').classList.add("transition-delay") })

 
  /* Code for the Toolbox Filter -- to display textboxes in sidepanel */
  let toolboxFilter_createCheckboxes = (nodeTypes, edgeTypes) => {

    // Create checkboxes for nodeTypes
	let txt = '<br/><b>Select node types to retain in graph:</b><br/>'  // initialize txt variable

    nodeTypes.sort()
    txt += nodeTypes.map( item => {
       return `<input type="checkbox" value="${item}" class="checkNode" checked>${item}<br>`
    }).join('')   // The output of map() is comma delimited by default. The join method is used to specify a different separator 

    // Display checkboxes
    document.getElementById('checkboxes-nodeTypes').innerHTML = txt;

    // Create checkboxes for edgeTypes
	txt = '<b>Select relation types to retain:</b><br/>'  // initialize txt variable
    edgeTypes.sort()
    txt += edgeTypes.map( item => {
       return `<input type="checkbox" value="${item}" class="checkEdge" checked>${item}<br>`
    }).join('')   

    document.getElementById('checkboxes-edgeTypes').innerHTML = txt;  // Display checkboxes
	$('#checkbox_submit1').style.visibility = 'visible'    // make submit buttons visible
	$('#checkbox_submit2').style.visibility = 'visible'    // make submit buttons visible
	$('#checkbox_clear1').style.visibility = 'visible'   
	$('#checkbox_clear2').style.visibility = 'visible'   
	$('#checkbox_reset1').style.visibility = 'visible'   
	$('#checkbox_reset2').style.visibility = 'visible'    
    acc[4].click()  // close accordion filter panel
	acc[4].click()  // re-open accordion panel
  }


  /* Process submit button1 and submit button2 */
  // Both buttons do the same thing -- apply node filter and edge filter

  let apply_filter = () => {

    // restore nodes and edges previously removed
	if (!node_edge_removed.empty()) node_edge_removed.restore()

    let node_edge_collection = cy.collection()  // collection of nodes and edges to remove
    let checkedList = []  // for collecting the checked boxes (nodes or edges)
    let checkedListValue = []   // to store an array of checked values extracted from checkedList

    // identify checked boxes for edge types 
    checkedList = document.querySelectorAll('.checkEdge:checked')  // collect the checked boxes for edges
	for (let i = 0; i < checkedList.length; i++) {
	  checkedListValue.push(checkedList[i].value)  // extract the values from the nodes
    }
    let uncheckedEdgeTypes = [] // array of unchecked edge type values
	
	// Compare edgeTypeRegistry array with checkedListValue array to identify unchecked edge types
	edgeTypeRegistry.forEach(item => {
		if (!checkedListValue.includes(item) && !uncheckedEdgeTypes.includes(item)) { uncheckedEdgeTypes.push(item) }
	})		
	// console.log(uncheckedEdgeTypes)

    // Identify edges in graph that match the unchecked values, and remove them
	let selector = ''   // var for constructing cytoscape selector
	for (let i = 0; i < uncheckedEdgeTypes.length; i++) {
	  selector = `edge[type = "${uncheckedEdgeTypes[i]}"]`
	  node_edge_collection = node_edge_collection.union(selector)
    }

    /* Apply node filter */
    // identify checked boxes for node types 
    checkedList = document.querySelectorAll('.checkNode:checked')  // collect the checked boxes (nodes)
    checkedListValue = []   // to store an array of checked values extracted from checkedList
	for (let i = 0; i < checkedList.length; i++) {
	  checkedListValue.push(checkedList[i].value)  // extract the values from the nodes
    }
	let uncheckedNodeTypes = []  // array of unchecked node type values
		
	// Compare nodeTypeRegistry with checkedListValue array to identify unchecked values
	nodeTypeRegistry.forEach(item => {
		if (!checkedListValue.includes(item) && !uncheckedNodeTypes.includes(item)) { 
		  uncheckedNodeTypes.push(item) 
		}
	})
	// console.log(uncheckedNodeTypes)

    // Select nodes in graph that match the unchecked types, and remove them
	for (let i = 0; i < uncheckedNodeTypes.length; i++) {    // run through the array
	  selector = `node[type = "${uncheckedNodeTypes[i]}"]`   // select nodes matching each type
	  node_edge_collection = node_edge_collection.union(selector)        // collect nodes into a collection
    }
	node_edge_removed = cy.remove( node_edge_collection )	             // remove nodes from graph, and store temporarily
  }

  // apply filter
  $('#checkbox_submit1').addEventListener('click', apply_filter)    
  $('#checkbox_submit2').addEventListener('click', apply_filter)  

  // uncheck all the boxes 
  $('#checkbox_clear1').addEventListener('click', function(){   
     document.querySelectorAll('.checkNode').forEach(function(checkbox){checkbox.checked=false}) })    
  $('#checkbox_clear2').addEventListener('click', function(){
     document.querySelectorAll('.checkEdge').forEach(function(checkbox){checkbox.checked=false}) })   

  // check all the boxes
  $('#checkbox_reset1').addEventListener('click', function(){   
     document.querySelectorAll('.checkNode').forEach(function(checkbox){checkbox.checked=true}) })   
  $('#checkbox_reset2').addEventListener('click', function(){
     document.querySelectorAll('.checkEdge').forEach(function(checkbox){checkbox.checked=true}) })   

 
  });
})();

