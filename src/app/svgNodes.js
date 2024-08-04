import * as d3 from 'd3';

export const createSVG = (svgContainer, canvasWidth, canvasHeight, type, color) => {
  console.log("Svg node:", type, "wurde erstellt");

  const svg = svgContainer
    .append("svg")
    .attr("width", canvasWidth) 
    .attr("height", canvasHeight)
    .attr("class", "absolute inset-0 cursor-pointer"); 

  svg
    .append("rect")
    .attr("width", 100)
    .attr("height", 50)
    .attr("fill", color); 

  svg
    .append("text")
    .attr("x", 50) 
    .attr("y", 25) 
    .attr("dy", ".35em") 
    .attr("text-anchor", "middle") 
    .attr("fill", "white") 
    .text(type); 


  const drag = d3.drag()
    .on("start", function (event) {
      d3.select(this).raise().classed("active", true);
    })
    .on("drag", function (event) {
      // Wende die Translation auf das SVG-Element an
      d3.select(this)
        .attr("transform", `translate(${event.x},${event.y})`);
    })
    .on("end", function (event) {
      const x = Math.round(event.x / 20) * 20;
      const y = Math.round(event.y / 20) * 20;
      // Wende die Translation auf das SVG-Element an
      d3.select(this)
        .attr("transform", `translate(${x},${y})`);
      d3.select(this).classed("active", false);
    });

  svg.call(drag);
};
