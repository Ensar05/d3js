import * as d3 from 'd3';
import { buttons } from './flowData';
import { uuid } from 'uuidv4';
const outputConnectionId = () => `output-${Math.random().toString(36).substr(2, 9)}`; //Damit wird überprüft welche Linie gelöscht werden soll, wenn connectionId gelöscht wird (z.117)
export const svgData = [];
const connections = [];


export const selectAllNodes = () => {
 d3.selectAll(".node").classed("selected", true)
} 

let copiedNodes = []
let copiedconnections = []

export const CopyNode = () => {
 copiedNodes = []
 copiedconnections = []
      
 const selectedNodes = d3.selectAll(".node.selected");  
 selectedNodes.each(function () {
   const nodeElement = d3.select(this);
   const originalTransform = nodeElement.attr("transform");
   const translate = originalTransform ? originalTransform.match(/translate\((.+),(.+)\)/) : [0, 0, 0];
   const originalX = parseFloat(translate[1]);
   const originalY = parseFloat(translate[2]);

   const type = nodeElement.select("text").text();

   copiedNodes.push({
    type,
    x: originalX,
    y: originalY
   })
 });
 const countNode = copiedNodes.length
 console.log(countNode)
 const countNodeD3 = d3.count(copiedNodes, count => count.x)
 console.log(countNodeD3)
}

export const copyPaste = ({ menuPosition }) => {
  d3.selectAll(".node.selected").classed("selected", false);

  if (copiedNodes.length === 0) {
    console.log("No nodes to paste.");
    return;
  }

  const topLeftNode = copiedNodes.reduce((topLeft, currentNode) => {
    if (
      currentNode.y < topLeft.y || 
      (currentNode.y === topLeft.y && currentNode.x < topLeft.x)
    ) {
      return currentNode;
    }
    return topLeft;
  }, copiedNodes[0]);

  console.log(topLeftNode)

  copiedNodes.forEach((copiedNode) => {
    const relativeX = copiedNode.x - topLeftNode.x;
    const relativeY = copiedNode.y - topLeftNode.y;

    const newX = menuPosition.left + relativeX - 240; 
    const newY = menuPosition.top + relativeY - 40;  

    const nodeId = uuid();

    createSVG(nodeId, copiedNode.type, newX, newY);

    d3.select(`#node${nodeId}`).classed("selected", true);
  });

  console.log("Eingefügte Nodes:", copiedNodes);
};

export const handleSave = async () => {
  try {
    const response = await fetch('/api/SaveJsonFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(svgData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result.message); // Erfolgsmeldung anzeigen
    } else {
      console.error('Error saving data:', await response.text());
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};


export const createSVG = (nodeId, type, x, y) => {
  const svgContainer = d3.select("#svg-container")
  console.log("SVG node:", type, "wurde erstellt");
  const buttonConfig = buttons.find(button => button.name === type);
    if (!buttonConfig) {
      console.error(`Button mit dem Typ ${type} wurde nicht gefunden.`);
      return;
    }

  const { color, connection } = buttonConfig;

  const initialNodeElement = {
    id: "node" + nodeId,
    type: type,
    connections: [],
    x: x,
    y: y 
  }

  svgData.push(initialNodeElement)
  console.log(svgData)
  console.log(initialNodeElement)

  const nodeMenu = document.getElementById('flowEditor');
  const nodeElement = svgContainer
    .append("g")
    .attr("class", "node")
    .attr("transform", `translate(${x}, ${y})`)
    .attr("id", "node" + nodeId)
    .on("click", (event) => {
      event.stopPropagation();
      nodeElement.classed("selected", true)
    })
    .on("dblclick", (event) => {
      document.getElementById('nodeMenu').classList.remove('hidden');
      nodeMenu.innerHTML = `<p>Type: ${initialNodeElement.type}</p><p>Node: ${initialNodeElement.nodeId}</p>`;
    });

  const rect = nodeElement.append("rect")
    .attr("width", 100)
    .attr("height", 40)
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("fill", color)
    .classed("border", true)

  const text = nodeElement.append("text")
    .attr("x", 50)
    .attr("y", 20)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text(type)
    .classed("cursor-pointer select-none", true);

  const input_connection = nodeElement.append("circle")
    .attr("class", "input-connection")
    .attr("cx", 0)
    .attr("cy", 20)
    .attr("r", 7)
    .attr("fill", "grey")
    .style("stroke", "black")
    .style("stroke-width", "1px");

  const output_connection = nodeElement.append("circle")
    .attr("class", "output-connection")
    .attr("cx", 100)
    .attr("cy", 20)
    .attr("r", 7)
    .attr("fill", "grey")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .attr("id", outputConnectionId);

  if (connection === "output") {
    input_connection.remove()
  }

  function removeSelectionOnFieldClick() {
    document.getElementById('nodeMenu').classList.add('hidden');
    nodeElement.classed("selected", false)
    d3.selectAll(".node").classed("selected", false)
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === "Delete" || event.key === "Backspace") {
      const selectedElement = d3.select(".selected");

      if (!selectedElement.empty()) {
        const selectedNodeId = selectedElement.attr("id");

        connections.forEach((connection) => {
          //Wird überprüft welche Node angeklickt wurde der eine connection beinhaltet mit der id des ausgewählten nodes. Jedes Node hat eine eindeutige Id zur Identifkation.
          const isFromSelectedNode = connection.from && connection.from.node().parentNode.id === selectedNodeId;
          const isToSelectedNode = connection.to && connection.to.id === selectedNodeId;

          if (isFromSelectedNode || isToSelectedNode) {
            // Lösche die Verbindung, die mit dem ausgewählten Node verbunden ist
            connection.path.remove();
            connection.connected = false;
          }
        });
        // Entferne den ausgewählten Node selbst
        selectedElement.remove();
        document.getElementById('nodeMenu').classList.add('hidden');
      } 
    }
  });

  let ctrlPressed = false

document.addEventListener('keydown', function(event) {
  if (event.key === 'Control' || event.ctrlKey) {
    ctrlPressed = true;
    console.log(ctrlPressed)
  }
});
document.addEventListener('keyup', function(event) {
  if (event.key === 'Control' || event.ctrlKey) {
    ctrlPressed = false;
    console.log(ctrlPressed)
  }
})


  const connectlines = d3.drag()
    .on("start", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const newPath = svgContainer.append("path")
        .attr("d", `M${mouseX},${mouseY} L${mouseX},${mouseY}`)
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("fill", "none")
        .classed("line z-10", true)
        .lower();

      connections.push({ id: outputConnectionId, path: newPath, from: output_connection, to: null, connected: false });
    })
    .on("drag", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const currentConnection = connections[connections.length - 1];
      if (currentConnection) {
        const startCoords = currentConnection.path.attr("d").split("L")[0].substring(1);
        const [startX, startY] = startCoords.split(",").map(Number);
        currentConnection.path.attr("d", `M${startX},${startY} L${mouseX},${mouseY}`);
      }
    })
    .on("end", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const currentConnection = connections[connections.length - 1];
      if (currentConnection) {
        const inputCircles = svgContainer.selectAll(".input-connection");
        const outputCircles = svgContainer.selectAll(".output-connection");

        inputCircles.each(function () {
          let inputCircle = d3.select(this);
          const inputNode = inputCircle.node().parentNode;
          const circlePos = inputCircle.node().getBoundingClientRect();
          const svgPos = svgContainer.node().getBoundingClientRect();
          const cx = circlePos.left - svgPos.left + circlePos.width / 2;
          const cy = circlePos.top - svgPos.top + circlePos.height / 2;
          const distance = Math.sqrt(Math.pow(mouseX - cx, 2) + Math.pow(mouseY - cy, 2));

          if (distance < 10) {
            const startCoords = currentConnection.path.attr("d").split("L")[0].substring(1);
            const [startX, startY] = startCoords.split(",").map(Number);

            currentConnection.path.attr("d", `M${startX},${startY} L${cx},${cy}`);
            currentConnection.to = inputNode;
            currentConnection.connected = true;

            const outputNode = 

            svgData[0].connections.push(inputNode);
            console.log(svgData)


            d3.select(this).attr("fill", "blue");
            console.log('Connected:', currentConnection);
            if (currentConnection.connection === false) {
              d3.select(this).attr("fill", "red");
            }
          }
        });

        if (!currentConnection.connected) {
          currentConnection.path.remove();
          connections.pop();
        }
      }
    });

  output_connection.call(connectlines);
  const deleteicon = document.getElementById('test')

  const drag = d3.drag()
    .on("start", function (event) {
      const [startX, startY] = d3.pointer(event, svgContainer.node());
      const transform = d3.select(this).attr("transform");
      const translate = transform ? transform.match(/translate\((.+),(.+)\)/) : [0, 0, 0];
      const offsetX = startX - parseFloat(translate[1]);
      const offsetY = startY - parseFloat(translate[2]);

      d3.select(this)
        .raise()
        .attr("data-offset-x", offsetX)
        .attr("data-offset-y", offsetY)

      // Berechnet und speichert die Offsets --> um Alle ausgewählten Nodes zu bewegen
      d3.selectAll(".selected").each(function () {
        const selTransform = d3.select(this).attr("transform");
        const selTranslate = selTransform ? selTransform.match(/translate\((.+),(.+)\)/) : [0, 0, 0];
        const selOffsetX = startX - parseFloat(selTranslate[1]);
        const selOffsetY = startY - parseFloat(selTranslate[2]);
        d3.select(this)
          .attr("data-offset-x", selOffsetX)
          .attr("data-offset-y", selOffsetY);
      });

      if (!d3.select(this).classed("selected") && ctrlPressed === false) {
        d3.selectAll(".node.selected")
          .classed("selected", false)

        d3.select(this)
          .classed("selected", true)
      }
    })
    .on("drag", function (event) {
      const offsetX = parseFloat(d3.select(this).attr("data-offset-x"));
      const offsetY = parseFloat(d3.select(this).attr("data-offset-y"));
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const x = mouseX - offsetX;
      const y = mouseY - offsetY;

      deleteicon.classList.add("opacity-100");

      d3.select(this).attr("transform", `translate(${x},${y})`);

      // Bewege alle ausgewählten Elemente
      d3.selectAll(".selected").each(function () {
        const selOffsetX = parseFloat(d3.select(this).attr("data-offset-x"));
        const selOffsetY = parseFloat(d3.select(this).attr("data-offset-y"));
        const selX = mouseX - selOffsetX;
        const selY = mouseY - selOffsetY;
        const movement = d3.select(this).attr("transform", `translate(${selX},${selY})`);
      });

      d3.selectAll(".node.selected").each(function() {
        const selectedNode = this;
      
        connections.forEach(conn => {
          if (conn.from && conn.from.node().parentNode === selectedNode) {
            const newCx = parseFloat(d3.select(selectedNode).attr('transform').match(/translate\((.+),(.+)\)/)[1]) + parseFloat(conn.from.attr('cx'));
            const newCy = parseFloat(d3.select(selectedNode).attr('transform').match(/translate\((.+),(.+)\)/)[2]) + parseFloat(conn.from.attr('cy'));
            const toNewCx = parseFloat(d3.select(conn.to).attr('transform').match(/translate\((.+),(.+)\)/)[1]) + parseFloat(conn.to.querySelector(".input-connection").getAttribute('cx'));
            const toNewCy = parseFloat(d3.select(conn.to).attr('transform').match(/translate\((.+),(.+)\)/)[2]) + parseFloat(conn.to.querySelector(".input-connection").getAttribute('cy'));
            conn.path.attr("d", `M${newCx},${newCy} L${toNewCx},${toNewCy}`);
          }
      
          if (conn.to && conn.to === selectedNode) {
            const toFromCx = parseFloat(d3.select(conn.from.node().parentNode).attr("transform").match(/translate\((.+),(.+)\)/)[1]) + parseFloat(conn.from.attr('cx'));
            const toFromCy = parseFloat(d3.select(conn.from.node().parentNode).attr("transform").match(/translate\((.+),(.+)\)/)[2]) + parseFloat(conn.from.attr('cy'));
            const toNewCx = parseFloat(d3.select(selectedNode).attr('transform').match(/translate\((.+),(.+)\)/)[1]) + parseFloat(conn.to.querySelector(".input-connection").getAttribute('cx'));
            const toNewCy = parseFloat(d3.select(selectedNode).attr('transform').match(/translate\((.+),(.+)\)/)[2]) + parseFloat(conn.to.querySelector(".input-connection").getAttribute('cy'));
            conn.path.attr("d", `M${toFromCx},${toFromCy} L${toNewCx},${toNewCy}`);
          }
        });
      });

    })
    .on("end", function (event) {
      const inputCircles = svgContainer.selectAll(".input-connection");
      const offsetX = parseFloat(d3.select(this).attr("data-offset-x"));
      const offsetY = parseFloat(d3.select(this).attr("data-offset-y"));
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const x = mouseX - offsetX;
      const y = mouseY - offsetY;

      deleteicon.classList.remove("opacity-100");

      if (x < 0 || y < 0) {
        d3.select(this).remove();
      }

      connections.forEach((connection) => {
        if (x < 0 || y < 0) {
          if (connection.from && connection.from.node().parentNode === this) {
            connection.path.remove();
            connection.connected = false;
            d3.selectAll(".selected").remove();
            console.log(connections)
          }
          if (connection.to === this) {
            connection.path.remove();
            connection.connected = false;
            d3.selectAll(".selected").remove();
          }
        }
      });
      console.log(`x-Achse: ${x} mauspos: ${mouseX} nodebereich: ${offsetX} nodeX: ${ d3.select(this).attr("transform")}`);
      console.log(svgData)
      console.log(this.id)

      let index = svgData.findIndex(node => node.id === this.id);

      if(index !== -1) {
        svgData[index].x = x
        svgData[index].y = y
        
      } else {
        console.log("die Ids stimmen nicht übereinander")
      }
    });

  nodeElement.call(drag);

  const selectAndEdit = d3.drag()
    .on("start", function (event) {
      const [startX, startY] = d3.pointer(event, svgContainer.node())
      const selectRectangular = svgContainer.append("rect")
        .attr("x", startX)
        .attr("y", startY)
        .attr("width", 0)
        .attr("height", 0)
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .attr("fill", "rgba(192, 192, 255, 0.3)")
        .classed("selectrect", true)
      event.subject.selectionRectangular = selectRectangular;
      event.subject.startX = startX;
      event.subject.startY = startY;
      removeSelectionOnFieldClick()
    })
    .on("drag", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const startX = event.subject.startX;
      const startY = event.subject.startY;
      const selectRectangular = event.subject.selectionRectangular;

      const newX = Math.min(mouseX, startX);
      const newY = Math.min(mouseY, startY);
      const newWidth = Math.abs(mouseX - startX);
      const newHeight = Math.abs(mouseY - startY);

      selectRectangular
        .attr("x", newX)
        .attr("y", newY)
        .attr("width", newWidth)
        .attr("height", newHeight);
      event.subject.width = newWidth;
      event.subject.height = newHeight;
      event.subject.newX = newX;
      event.subject.newY = newY;

    })
    .on("end", function (event) {
      const newX = event.subject.newX;
      const newY = event.subject.newY;
      const newWidth = event.subject.width;
      const newHeight = event.subject.height;

      const nodeFlow = d3.selectAll(".node")

      const currentConnection = connections[connections.length - 1];

      nodeFlow.each(function () {
        const node = d3.select(this);

        const transform = node.attr("transform");
        const translate = transform ? transform.match(/translate\((.+),(.+)\)/) : [0, 0, 0];
        const nodeX = parseFloat(translate[1]);
        const nodeY = parseFloat(translate[2]);

        const nodeWidth = parseFloat(rect.attr("width"));
        const nodeHeight = parseFloat(rect.attr("height"));

        if (
          nodeX < newX + newWidth && nodeX + nodeWidth > newX &&
          nodeY < newY + newHeight && nodeY + nodeHeight > newY
        ) {
          node.classed("selected", true)
          node.selectChild(".line").classed("selectedline", true)

        }
      });
      d3.selectAll(".selectrect").remove();
    })
  svgContainer.call(selectAndEdit)

};



export const clearAllNodes = () => {
  d3.selectAll(".node").remove();
  d3.selectAll(".line").remove();
};
