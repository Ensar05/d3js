import * as d3 from 'd3';

const svgData = [];

export const createSVG = (svgContainer, canvasWidth, canvasHeight, type, color, darkMode) => {
  console.log("Svg node:", type, "wurde erstellt");

  // Erstelle das nodeElement als Gruppe
  const nodeElement = svgContainer
    .append("g")
    .attr("class", "node")
    .on("click", (event) => {
      event.stopPropagation();
      rect
        .style('stroke', 'orange')
        .style("stroke-width", "2px")

      document.getElementById('nodeMenu').classList.add('opacity-100')
    }
    );

  const rect = nodeElement
    .append("rect")
    .attr("width", 100)
    .attr("height", 40)
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("fill", color)
    .style("stroke", "black")
    .style("stroke-width", "1px")


  const text = nodeElement
    .append("text")
    .attr("x", 50)
    .attr("y", 20)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text(type)
    .classed("cursor-pointer select-none", true);

  const input_connection = nodeElement
    .append("circle")
    .attr("class", "input-connection")
    .attr("cx", 0)
    .attr("cy", 20)
    .attr("r", 7)
    .attr("fill", "grey")
    .style("stroke", "black")
    .style("stroke-width", "1px");

  const output_connection = nodeElement
    .append("circle")
    .attr("class", "output-connection")
    .attr("cx", 100)
    .attr("cy", 20)
    .attr("r", 7)
    .attr("fill", "grey")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .classed("lineConnected", false);


  const connections = [];

  svgContainer.on("click", () => {
    rect
      .style('stroke', 'black')
      .style("stroke-width", "1px")
    document.getElementById('nodeMenu').classList.remove('opacity-100')
  })

  const connectlines = d3.drag()
    .on("start", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const newLine = svgContainer
        .append("line")
        .attr("x1", mouseX)
        .attr("y1", mouseY)
        .attr("x2", mouseX)
        .attr("y2", mouseY)
        .attr("stroke-width", 2)
        .attr("stroke", darkMode ? "white" : "black")
        .classed("line", true)
        .lower(); 

      connections.push({ line: newLine, from: output_connection });
    })
    .on("drag", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const currentConnection = connections[connections.length - 1];
      if (currentConnection) {
        currentConnection.line
          .attr("x2", mouseX)
          .attr("y2", mouseY);
      }
    })
    .on("end", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const currentConnection = connections[connections.length - 1];
      if (currentConnection) {
        const inputCircles = svgContainer.selectAll(".input-connection");
        let connected = false;
        inputCircles.each(function () {
          const inputCircle = d3.select(this);
          const inputNode = inputCircle.node().parentNode;

          // Container Position des inputCircle berechnen
          const circlePos = inputCircle.node().getBoundingClientRect();
          const svgPos = svgContainer.node().getBoundingClientRect();

          const cx = circlePos.left - svgPos.left + circlePos.width / 2;
          const cy = circlePos.top - svgPos.top + circlePos.height / 2;

          const distance = Math.sqrt(Math.pow(mouseX - cx, 2) + Math.pow(mouseY - cy, 2));

          if (distance < 10) {
            currentConnection.line
              .attr("x2", cx)
              .attr("y2", cy);

            // Update the connection with the input circle
            currentConnection.to = inputCircle;
            connected = true;
          }
        });
        if (!connected) {
          currentConnection.line.remove();
          connections.pop();  // Remove the connection if not connected
        }
      }
      console.log(connections);
    });

  output_connection.call(connectlines);


  const nodemenu = document.getElementById('nodeMenu')
  const deleteicon = document.getElementById('test')
  let selected = false;
  // Drag für das Verschieben von Knoten
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
        .attr("data-offset-y", offsetY);

      selected = true;
    })
    .on("drag", function (event) {
      const offsetX = parseFloat(d3.select(this).attr("data-offset-x"));
      const offsetY = parseFloat(d3.select(this).attr("data-offset-y"));

      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const x = mouseX - offsetX;
      const y = mouseY - offsetY;

      // Verschiebe das Node-Element
      d3.select(this)
        .attr("transform", `translate(${x},${y})`);

      // Aktualisiere die Verbindungen
      connections.forEach(conn => {
        if (conn.from.node().parentNode === this) {
          const newCx = x + parseFloat(conn.from.attr('cx'));
          const newCy = y + parseFloat(conn.from.attr('cy'));
          conn.line
            .attr("x1", newCx)
            .attr("y1", newCy);
        }
        if (conn.to && conn.to.node().parentNode === this) {
          const newCx = x + parseFloat(conn.to.attr('cx'));
          const newCy = y + parseFloat(conn.to.attr('cy'));
          conn.line
            .attr("x2", newCx)
            .attr("y2", newCy);
        }
      });
      deleteicon.classList.add('opacity-100')
    })
    .on("end", function (event) {
      const offsetX = parseFloat(d3.select(this).attr("data-offset-x"));
      const offsetY = parseFloat(d3.select(this).attr("data-offset-y"));

      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const x = mouseX - offsetX;
      const y = mouseY - offsetY;

      if (x < 0 || y < 0) {
        d3.select(this).remove();
      } else {
        d3.select(this)
          .attr("transform", `translate(${x},${y})`);
      }

      const svgElement = {
        type: type,
        color: color,
        x: x,
        y: y,
        width: 100,
        height: 50
      };
      console.log(x, y, type, color);
      deleteicon.classList.remove('opacity-100')
    });

  if (selected === true) {
    nodemenu.classList.add("opacity-100")
  }

  nodeElement.call(drag);

  const initialSvgElement = {
    type: type,
    color: color,
    x: 0,
    y: 0,
    width: 100,
    height: 50
  };
  console.log(initialSvgElement)
};

export const clearAllNodes = () => {
  d3.selectAll(".node").remove();
  d3.selectAll(".line").remove();
};
