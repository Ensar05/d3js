"use client" 
import { useEffect } from "react";
import * as d3 from "d3";

export default function Home() {
  const createSVG = () => {
    const svgContainer = d3.select("#svg-container");
    const functionLists = d3.select("#functions")

    /*
    const functions = functionLists
      .append("svg")
      .attr("width", 100)
      .attr("height",50)

  
  functions
    .append("rect")
    .attr("width", 80)
    .attr("height", 50)
    .attr("fill", "red");
    */

    const svg = svgContainer
      .append("svg")
      .attr("width", 200) 
      .attr("height", 100); 
      
    svg
      .append("rect")
      .attr("width", 100) 
      .attr("height", 50) 
      .attr("fill", "orange");

      function Open() {
        document.getElementById("myDropdown").classList.toggle("show");
      }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="svg-container w-full items-center text-sm lg:flex">

        <div className="menuDiv border-2 min-h-screen max-w-64 pr-8 p-2 color">
          <input type="text" placeholder="Nodes suchen.." />
          <div className="nodeDropdown">
            <button onClick="Open" className="block">Allgemein</button>
            <button className="block">Funktionen</button>
            <button className="block">Anderes</button>
          </div>
          <div>

          </div>
        </div>

      <button onClick={createSVG}>
        Hier klicken
      </button>

      <div id="functionContainer"></div>

      </div>
    </main>
  );
}
