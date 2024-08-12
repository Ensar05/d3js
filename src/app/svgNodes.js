import * as d3 from 'd3';
const svgData = [];

export const createSVG = (svgContainer, canvasWidth, canvasHeight, type, color, darkMode) => {
  console.log("Svg node:", type, "wurde erstellt");

  const nodeElement = svgContainer.append("g")
    .attr("class", "node")
    .on("click", (event) => {
      event.stopPropagation();
      rect.style('stroke', 'orange').style("stroke-width", "2px");
      document.getElementById('nodeMenu').classList.add('opacity-100');
    });

  const rect = nodeElement.append("rect")
    .attr("width", 100)
    .attr("height", 40)
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("fill", color)
    .style("stroke", "black")
    .style("stroke-width", "1px");

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
    .style("stroke-width", "1px");

  const connections = [];

  svgContainer.on("click", () => {
    rect.style('stroke', 'black').style("stroke-width", "1px");
    document.getElementById('nodeMenu').classList.remove('opacity-100');
  });

  const connectlines = d3.drag()
    .on("start", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const newPath = svgContainer.append("path")
        .attr("d", `M${mouseX},${mouseY} L${mouseX},${mouseY}`)
        .attr("stroke-width", 2)
        .attr("stroke", darkMode ? "white" : "black")
        .attr("fill", "none")
        .classed("line", true)
        .lower();

      connections.push({ path: newPath, from: output_connection, to: null });
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
        let connected = false;
        inputCircles.each(function () {
          const inputCircle = d3.select(this);
          const circlePos = inputCircle.node().getBoundingClientRect();
          const svgPos = svgContainer.node().getBoundingClientRect();
          const cx = circlePos.left - svgPos.left + circlePos.width / 2;
          const cy = circlePos.top - svgPos.top + circlePos.height / 2;

          const distance = Math.sqrt(Math.pow(mouseX - cx, 2) + Math.pow(mouseY - cy, 2));

          if (distance < 10) {
            const startCoords = currentConnection.path.attr("d").split("L")[0].substring(1);
            const [startX, startY] = startCoords.split(",").map(Number);
            currentConnection.path.attr("d", `M${startX},${startY} L${cx},${cy}`);

            currentConnection.to = inputCircle;
            connected = true;

            inputCircle.datum(currentConnection);
          }
        });
        if (!connected) {
          currentConnection.path.remove();
          connections.pop();
        }
      }

      if (currentConnection && currentConnection.to) {
        console.log('Connection TO set:', currentConnection.to);
      } else {
        console.error('Connection TO not set!');
      }
    });


  output_connection.call(connectlines);

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
    })
    .on("drag", function (event) {
      const offsetX = parseFloat(d3.select(this).attr("data-offset-x"));
      const offsetY = parseFloat(d3.select(this).attr("data-offset-y"));
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      const x = mouseX - offsetX;
      const y = mouseY - offsetY;

      d3.select(this).attr("transform", `translate(${x},${y})`);

      connections.forEach(conn => {
        if (conn.from && conn.from.node().parentNode === this) {
          const newCx = x + parseFloat(conn.from.attr('cx'));
          const newCy = y + parseFloat(conn.from.attr('cy'));
          const endCoords = conn.path.attr("d").split("L")[1];
          conn.path.attr("d", `M${newCx},${newCy} L${endCoords}`);
        }
        if (conn.to && conn.to.node().parentNode === this) {
          const newCx = x + parseFloat(conn.to.attr('cx'));
          const newCy = y + parseFloat(conn.to.attr('cy'));
          const startCoords = conn.path.attr("d").split("L")[0].substring(1);
          conn.path.attr("d", `M${startCoords} L${newCx},${newCy}`);
        }
      console.log(conn.to)
      });
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
        d3.select(this).attr("transform", `translate(${x},${y})`);
      }
    });

  nodeElement.call(drag);
};

export const clearAllNodes = () => {
  d3.selectAll(".node").remove();
  d3.selectAll(".line").remove();
};
