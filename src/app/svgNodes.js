import * as d3 from 'd3';

const svgData = [];

export const createSVG = (svgContainer, canvasWidth, canvasHeight, type, color, darkMode) => {
  console.log("Svg node:", type, "wurde erstellt");

  const nodeElement = svgContainer
    .append("g")
    .attr("class", "node");

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
    .classed("cursor-pointer select-none", true);

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

  const drag = d3.drag()
  .on("start", function (event) {
    // Aktuelle Position des Nodes erfassen
    const [startX, startY] = d3.pointer(event, svgContainer.node());
    // Ursprüngliche Position des Nodes erfassen
    const transform = d3.select(this).attr("transform");
    const translate = transform ? transform.match(/translate\((.+),(.+)\)/) : [0, 0, 0];
    const offsetX = startX - parseFloat(translate[1]);
    const offsetY = startY - parseFloat(translate[2]);

    // Daten an das Element anhängen
    d3.select(this)
      .raise()
      .attr("data-offset-x", offsetX)
      .attr("data-offset-y", offsetY);
    
      console.log(startX, startY, offsetX, offsetY);
  })
  .on("drag", function (event) {
    // Offset-Werte abrufen
    const offsetX = parseFloat(d3.select(this).attr("data-offset-x"));
    const offsetY = parseFloat(d3.select(this).attr("data-offset-y"));

    // Aktuelle Position des Mauszeigers erfassen
    const [mouseX, mouseY] = d3.pointer(event, svgContainer.node());
    const x = mouseX - offsetX;
    const y = mouseY - offsetY;

    // Node-Element verschieben
    d3.select(this)
      .attr("transform", `translate(${x},${y})`);
  })
  .on("end", function (event) {
    // Offset-Werte abrufen
    const offsetX = parseFloat(d3.select(this).attr("data-offset-x"));
    const offsetY = parseFloat(d3.select(this).attr("data-offset-y"));

    // Aktuelle Position des Mauszeigers erfassen
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
    console.log(x, y);

    // svgData.push(svgElement);
    // console.log(JSON.stringify(svgData, null, 2));
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
