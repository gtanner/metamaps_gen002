function selectEdgeOnClickHandler(adj, e) {
  
  if (Mconsole.busy) return;
  
  //editing overrides everything else
  if (e.altKey) {
    //in select-edit-delete-nodes-and-edges.js
    editEdge(adj, e);
    return;
  }

  var showDesc = adj.getData("showDesc");
  if (showDesc && e.shiftKey) {
    //deselecting an edge with shift
    deselectEdge(adj);
  } else if (!showDesc && e.shiftKey) {
    //selecting an edge with shift
    selectEdge(adj);
  } else if (showDesc && !e.shiftKey) {
    //deselecting an edge without shift - unselect all
    deselectAllEdges();
  } else if (!showDesc && !e.shiftKey) {
    //selecting an edge without shift - unselect all but new one
    deselectAllEdges();
    selectEdge(adj);
  }

  Mconsole.plot();
}//selectEdgeOnClickHandler

function nodeDoubleClickHandler(node, e) {
  if (userid == null) {
    return;
  }

  //greenCircle being true denotes it's actually "in the commons" still
  if (node.getData('greenCircle') == false) {
    return;
  }

  //this line adds it to the console if you close seek
  node.setData('greenCircle', false);

  //this is just aesthetic
  deselectNode(node);

  //this adds the node to the map, if it's a map
  if (window.mapid) {
    $.post('/mappings',
           {
             topic: {id: node.id},
             map: {id: window.mapid},
             xloc: node.pos.x,
             yloc: node.pos.y
           },
           function(data, textStatus, jqXHR) {
             console.log(data);
             node.setData('mappingid', data.id);
           });
  }
    
}//doubleClickNodeHandler

/*
 * Returns a boolean saying if the node was double clicked in our understanding of the word
 */
function nodeWasDoubleClicked() {
   //grab the timestamp of the click 
   var storedTime = MetamapsModel.lastNodeClick;
   var now = Date.now(); //not compatible with IE8 FYI 
   MetamapsModel.lastNodeClick = now;
 
   if (now - storedTime < MetamapsModel.DOUBLE_CLICK_TOLERANCE) { 
     return true;
   } else {
     return false;
   }
}//nodeWasDoubleClicked;

function selectNodeOnClickHandler(node, e) {
  if (Mconsole.busy) return;

  if (nodeWasDoubleClicked()) {
    nodeDoubleClickHandler(node, e);
    return;
  }
  
  if (gType != "centered") {
      //set final styles
      if (!e.shiftKey) {
          Mconsole.graph.eachNode(function (n) {
            if (n.id != node.id) {
              deselectNode(n);
            }
          });
      }
      if (node.selected) {
        deselectNode(node);
      } else {
        selectNode(node);
      }
      //trigger animation to final styles
      Mconsole.fx.animate({
        modes: ['edge-property:lineWidth:color:alpha'],
        duration: 500
      });
      Mconsole.plot();
  }
}//selectNodeOnClickHandler

function canvasDoubleClickHandler(canvasLoc,e) { 
   //grab the location and timestamp of the click 
   var storedTime = MetamapsModel.lastCanvasClick;
   var now = Date.now(); //not compatible with IE8 FYI 
   MetamapsModel.lastCanvasClick = now;
 
   if (now - storedTime < MetamapsModel.DOUBLE_CLICK_TOLERANCE) { 
      //pop up node creation :) 
      $('#topic_grabTopic').val("null"); 
      $('#topic_addSynapse').val("false"); 
      $('#new_topic').css('left', e.clientX + "px"); 
      $('#new_topic').css('top', e.clientY + "px"); 
      $('#topic_x').val(canvasLoc.x); 
      $('#topic_y').val(canvasLoc.y);
      $('#topic_name').autocomplete('enable');      
      $('#new_topic').fadeIn('fast'); 
      addMetacode(); 
      $('#topic_name').focus(); 
   } else { 
      $('#new_topic').fadeOut('fast'); 
      $('#new_synapse').fadeOut('fast'); 
      tempInit = false; 
      tempNode = null; 
      tempNode2 = null; 
      Mconsole.plot(); 
   } 
}//canvasDoubleClickHandler 

function handleSelectionBeforeDragging(node, e) {
  // four cases:
  // 1 nothing is selected, so pretend you aren't selecting
  // 2 others are selected only and shift, so additionally select this one
  // 3 others are selected only, no shift: drag only this one
  // 4 this node and others were selected, so drag them (just return false)
  //return value: deselect node again after?
  if (MetamapsModel.selectedNodes.length == 0) {
    selectNode(node);
    return 'deselect';
  }
  if (MetamapsModel.selectedNodes.indexOf(node) == -1) {
    if (e.shiftKey) {
      selectNode(node);
      return 'nothing';
    } else {
      return 'only-drag-this-one';
    }
  }
  return 'nothing'; //case 4?
}

function onDragMoveTopicHandler(node, eventInfo, e) {
    if (node && !node.nodeFrom) {
       $('#new_synapse').fadeOut('fast');
       $('#new_topic').fadeOut('fast');
       var pos = eventInfo.getPos();
       // if it's a left click, move the node
       if (e.button == 0 && !e.altKey && (e.buttons == 0 || e.buttons == 1 || e.buttons == undefined)) {
           //if the node dragged isn't already selected, select it
           var whatToDo = handleSelectionBeforeDragging(node, e);
           if (whatToDo == 'only-drag-this-one') {
             node.pos.setc(pos.x, pos.y);
             node.setData('xloc', pos.x);
             node.setData('yloc', pos.y);
           } else {
             var len = MetamapsModel.selectedNodes.length;

             //first define offset for each node
             var xOffset = new Array();
             var yOffset = new Array();
             for (var i = 0; i < len; i += 1) {
               n = MetamapsModel.selectedNodes[i];
               xOffset[i] = n.getData('xloc') - node.getData('xloc');
               yOffset[i] = n.getData('yloc') - node.getData('yloc');
             }//for

             for (var i = 0; i < len; i += 1) {
               n = MetamapsModel.selectedNodes[i];
               n.pos.setc(pos.x + xOffset[i], pos.y + yOffset[i]);
               n.setData('xloc', pos.x + xOffset[i]);
               n.setData('yloc', pos.y + yOffset[i]);
             }//for
           }//if

           if (whatToDo == 'deselect') {
             deselectNode(node);
           }
           dragged = node.id;
           Mconsole.plot();
       }
       // if it's a right click or holding down alt, start synapse creation  ->third option is for firefox
       else if ((e.button == 2 || (e.button == 0 && e.altKey) || e.buttons == 2) && userid != null) {
           if (tempInit == false) {
              tempNode = node;
              tempInit = true;
           }
           //
           temp = eventInfo.getNode();
           if (temp != false && temp.id != node.id) { // this means a Node has been returned
              tempNode2 = temp;
              Mconsole.plot();
              renderMidArrow({ x: tempNode.pos.getc().x, y: tempNode.pos.getc().y }, { x: temp.pos.getc().x, y: temp.pos.getc().y }, 13, false, Mconsole.canvas);
              // before making the highlighted one bigger, make sure all the others are regular size
              Mconsole.graph.eachNode(function (n) {
                  n.setData('dim', 25, 'current');
              });
              temp.setData('dim',35,'current');
              Mconsole.fx.plotNode(tempNode, Mconsole.canvas);
              Mconsole.fx.plotNode(temp, Mconsole.canvas);
           } else if (!temp) {
               tempNode2 = null;
               Mconsole.graph.eachNode(function (n) {
                  n.setData('dim', 25, 'current');
               });
               //pop up node creation :)
              $('#topic_grabTopic').val("null");
              var myX = e.clientX - 110;
              var myY = e.clientY - 30;
              $('#new_topic').css('left',myX + "px");
              $('#new_topic').css('top',myY + "px");
              $('#new_synapse').css('left',myX + "px");
              $('#new_synapse').css('top',myY + "px");
              $('#topic_x').val(eventInfo.getPos().x);
              $('#topic_y').val(eventInfo.getPos().y);
              Mconsole.plot();
              renderMidArrow({ x: tempNode.pos.getc().x, y: tempNode.pos.getc().y }, { x: pos.x, y: pos.y }, 13, false, Mconsole.canvas);
              Mconsole.fx.plotNode(tempNode, Mconsole.canvas);
           }
       }
   }
}
