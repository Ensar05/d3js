"use client"
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import * as d3 from 'd3';

export default function Home() {
  const [isVisible, setIsVisible] = useState(true);
  const canvasRef = useRef(null);
  const sv78gContainerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gridSize = 20; // Größe des Karos

    const drawGrid = () => {
      // Canvas Größe setzen
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Karomuster zeichnen
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas löschen
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.strokeStyle = '#ddd'; // Farbe des Rasters
          ctx.strokeRect(x, y, gridSize, gridSize);
        }
      }
    };

    drawGrid();
    window.addEventListener('resize', drawGrid); // Neuzeichnen bei Größenänderung

    return () => {
      window.removeEventListener('resize', drawGrid);
    };
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const createSVG = () => {
    const svgContainer = d3.select(svgContainerRef.current);
    console.log("clicked!");

    const drag = d3.drag()
      .on("start", function(event) {
        // Initialisiere `d` für Drag-Daten
        d3.select(this).raise().classed("active", true);
      })
      .on("drag", function(event) {
        // Aktualisiere Position des Rechtecks
        d3.select(this)
          .attr("x", event.x)
          .attr("y", event.y);

        // Aktualisiere Position des Textes
        d3.select(this.parentNode).select("text")
          .attr("x", event.x + 50)
          .attr("y", event.y + 25);
      })
      .on("end", function(event) {
        // Stelle sicher, dass die Rechteckposition auf das nächste Raster gerundet wird
        d3.select(this)
          .attr("x", Math.round(event.x / 20) * 20)
          .attr("y", Math.round(event.y / 20) * 20);

        // Aktualisiere den Text auf die neue Position
        d3.select(this.parentNode).select("text")
          .attr("x", Math.round(event.x / 20) * 20 + 50)
          .attr("y", Math.round(event.y / 20) * 20 + 25);

        d3.select(this).classed("active", false);
      });

    // SVG hinzufügen
    const svg = svgContainer
      .append("svg")
      .attr("width", 1000)
      .attr("height", 100)
      .attr("class", "inline-block mr-4 cursor-pointer") // Tailwind-Klassen zum Anordnen und Zeiger-Cursor

    // Rechteck hinzufügen
    svg
      .append("rect")
      .attr("width", 100)
      .attr("height", 50)
      .attr("fill", "#3b82f6") // Blaue Farbe des Rechtecks
      .attr("x", 0)
      .attr("y", 0)
      .call(drag); // Drag-Verhalten hinzufügen

    svg
      .append("text")
      .attr("x", 50) // X-Position des Textes (zentriert)
      .attr("y", 25) // Y-Position des Textes (zentriert)
      .attr("dy", ".35em") // Vertikale Ausrichtung
      .attr("text-anchor", "middle") // Horizontale Ausrichtung
      .attr("fill", "white") // Textfarbe
      .text("Start"); // Textinhalt
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Head>
        <script src="https://kit.fontawesome.com/fa58a785b1.js" crossorigin="anonymous"></script>
      </Head>
      <div className="flex w-full h-full text-sm">
        <div className="menuDiv border-2 min-h-screen max-w-xs pr-8 p-2 color">
          <input type="text" placeholder="Nodes suchen.." />
          <button onClick={toggleVisibility} className="block">Allgemein
            <i className="fa-solid fa-caret-down"></i>
          </button>
          {isVisible && (
            <div className="nodeDropdown">
              <a href="#test1">Test1</a>
              <a href="#test2">Test2</a>
              <a href="#test3">Test3</a>
            </div>
          )}
          <button className="block">Funktionen</button>
          <button className="block">Anderes</button>
          <button onClick={createSVG} className="block bg-blue-500 text-white px-4 py-2 rounded">
            Hier klicken
          </button>
        </div>
        <div className="flex-1 relative flex">
          <canvas ref={canvasRef} className="w-full h-full"></canvas>
          <div ref={svgContainerRef} id="svg-container" className="absolute inset-0 flex items-start"></div>
        </div>
      </div>
      <div id="functionContainer"></div>
    </main>
  );
}
