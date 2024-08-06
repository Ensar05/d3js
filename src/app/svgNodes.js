import * as d3 from 'd3';

const svgData = [];

export const createSVG = (svgContainer, canvasWidth, canvasHeight, type, color, darkMode) => {
  console.log("Svg node:", type, "wurde erstellt");

  const nodeElement = svgContainer.append("g")
    .attr("class", "node"); // Setze eine Klasse für das Knoten-Element

  const rect = nodeElement
    .append("rect")
    .attr("width", 100)
    .attr("height", 50)
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("fill", color);

  const text = nodeElement
    .append("text")
    .attr("x", 50)
    .attr("y", 25)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text(type)
    .classed("cursor-pointer", true);

  const input_connection = nodeElement
    .append("circle")
    .attr("class", "input-connection") // Setze eine Klasse für die Verbindungs-Kreise
    .attr("cx", 0)
    .attr("cy", 25)
    .attr("r", 8)
    .attr("fill", "grey");

  const output_connection = nodeElement
    .append("circle")
    .attr("class", "output-connection") // Setze eine Klasse für die Verbindungs-Kreise
    .attr("cx", 100)
    .attr("cy", 25)
    .attr("r", 8)
    .attr("fill", "grey");

  let line = null;

  const connectlines = d3.drag()
    .on("start", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      line = svgContainer
        .append("line")
        .attr("x1", d3.pointer(event, svgContainer.node())[0])
        .attr("y1", d3.pointer(event, svgContainer.node())[1])
        .attr("x2", mouseX)
        .attr("y2", mouseY)
        .attr("stroke-width", 2)
        .attr("stroke", darkMode ? "white" : "black");
    })
    .on("drag", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      if (line) {
        line
          .attr("x2", mouseX)
          .attr("y2", mouseY);
      }
    })
    .on("end", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
      if (line) {
        const inputCircles = svgContainer.selectAll(".input-connection");
        let connected = false;
        inputCircles.each(function() {
          const inputCircle = d3.select(this);
          const cx = parseFloat(inputCircle.attr('cx')) + parseFloat(nodeElement.attr('transform')?.match(/translate\((.+),(.+)\)/)?.[1] || 0);
          const cy = parseFloat(inputCircle.attr('cy')) + parseFloat(nodeElement.attr('transform')?.match(/translate\((.+),(.+)\)/)?.[2] || 0);
          const distance = Math.sqrt(Math.pow(mouseX - cx, 2) + Math.pow(mouseY - cy, 2));
          if (distance < 10) { // Verbindung herstellen, wenn die Entfernung weniger als 10 beträgt
            line
              .attr("x2", cx)
              .attr("y2", cy);
            connected = true;
          }
        });
        if (!connected) {
          line.remove(); // Linie entfernen, wenn keine Verbindung hergestellt wurde
        }
      }
    });

  output_connection.call(connectlines);

  // Nodes ziehen
  const drag = d3.drag()
    .on("start", function (event) {
      d3.select(this).raise().classed("active", true);
    })
    .on("drag", function (event) {
      d3.select(this)
        .attr("transform", `translate(${event.x},${event.y})`);
    })
    .on("end", function (event) {
      const x = Math.round(event.x);
      const y = Math.round(event.y);
      if (x < 0 || y < 0) {
        d3.select(this).remove();
      } else {
        d3.select(this)
          .attr("transform", `translate(${x},${y})`);
      }
      d3.select(this).classed("active", false);

      const svgElement = {
        type: type,
        color: color,
        x: x,
        y: y,
        width: 100,
        height: 50
      };

      /**
      svgData.push(svgElement);
      console.log(JSON.stringify(svgData, null, 2));
      */
    });

  nodeElement.call(drag);

  const initialSvgElement = {
    type: type,
    color: color,
    x: 0,
    y: 0,
    width: 100,
    height: 50
  };

  /**
  svgData.push(initialSvgElement);
  console.log(JSON.stringify(svgData, null, 2));
  */
};
