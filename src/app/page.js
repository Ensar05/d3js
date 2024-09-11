"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as svgNodes from './svgNodes';
import { categories, buttons } from './flowData';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredCategory, setFilteredCategory] = useState(["allgemein", "funktionen"]);
  const [menu, setMenu] = useState(false)
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gridSize = 20;

    const drawGrid = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = darkMode ? '#555' : '#ddd';
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.strokeRect(x, y, gridSize, gridSize);
        }
      }

      const NodeCreate = d3.selectAll(".Button");

      const dragCreate = d3.drag()
        .on("start", function (event) {
          const clonedNode = this.cloneNode(true);
          clonedNode.className = this.className;

          this.parentNode.appendChild(clonedNode);

          d3.select(clonedNode)
            .attr("transform", `translate(${event.x}, ${event.y})`)
            .classed("absolute", true);

          this.clonedButton = clonedNode;
        })
        .on("drag", function (event) {
          d3.select(this.clonedButton)
            .attr("transform", `translate(${event.x}, ${event.y})`);
        })
        .on("end", function (event) {
          const clonedNode = this.cloneNode(true);
          this.clonedButton.remove();
          const value = clonedNode.value;
          const bgColor = clonedNode.bgColor;
          if (event.x > 256) {
            svgNodes.createSVG(d3.select('#svg-container'), value, `#3b82f6`, darkMode, `output`, event.x - 306, event.y + 60)
          }
        });

      dragCreate(NodeCreate);

    };

    drawGrid();
    window.addEventListener('resize', drawGrid);

    return () => {
      window.removeEventListener('resize', drawGrid);
    };
  }, [darkMode]);

  const toggleDarkmode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const toggleDropdown = (selectedCategory) => {
    if (filteredCategory.includes(selectedCategory)) {
      let categories = filteredCategory.filter((e) => e !== selectedCategory);
      setFilteredCategory(categories);
    } else {
      setFilteredCategory([...filteredCategory, selectedCategory]);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value.toLowerCase());
  };

  const searchedButtons = buttons.filter(button =>
    button.name.toLowerCase().includes(search)
  );

  const toggleMenu = (e) => {
    setMenu(!menu)
    if (!menu) {
      menuTab.classList.remove('hidden')
    } else {
      menuTab.classList.add('hidden')
    }

    console.log(menu)
  }

  return (
<main className="flex overflow-hidden">
  <div className="flex flex-col w-full h-full text-sm">
    <div className="menuDiv fixed h-screen flex flex-col items-start z-40 w-60 p-2 color border-r-2 border-gray-400 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 select-none">
      <div className='flex bg-white items-center w-full pl-1'>
        <img src='././icons/search.png' className='h-fit' alt="Search" />
        <input type="text" placeholder="Nodes suchen.." onChange={handleSearch} className="h-8 pl-1 border-0 outline-0" />
      </div>
      {categories.map((category) => (
        <div key={category.name}>
          <div
            onClick={() => toggleDropdown(category.category)}
            className={`block text-lg font-bold my-1 cursor-pointer ${filteredCategory.includes(category.category) ? "active" : ""}`}
          >
            {category.name}
          </div>
          {filteredCategory.includes(category.category) && (
            <div className="nodeDropdown pl-2">
              {searchedButtons
                .filter(button => button.category === category.category)
                .map((button) => (
                  <button
                    key={button.name}
                    value={button.name}
                    onClick={() => svgNodes.createSVG(d3.select('#svg-container'), `${button.name}`, `${button.color}`, darkMode, `${button.connection}`, 0, 40)}
                    className={`Button block ${button.bgColor} text-white px-4 py-2 rounded mb-2`}
                  >
                    {button.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      ))}
      <label className="mt-auto flex">
        <input type="checkbox" className="sr-only peer" onChange={toggleDarkmode} />
        <p>{darkMode ? 'Lichtmodus aktivieren' : 'Dunkelmodus aktivieren'}</p>
        <div className="relative ml-1 w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
      <img id="test" className='opacity-0 transition-opacity duration-300 select-none' src='././icons/bin.png' alt="Bin" />
    </div>

    <div id="fieldside" className="flex-1 flex flex-row relative select-none ml-60">
      <div id="FlowSelektor" className='flex absolute top-0 right-0 z-50 w-full h-10 color border-r-2 border-b-2 border-gray-400 justify-between'>
        <div className='flex items-center'>
          <div className='ml-3 p-2 pr-16 border-x-2 border-t-2 border-gray-400'>
            Flow 1
          </div>
          <div className='ml-2 p-2 pr-16 border-x-2 border-t-2 border-gray-400'>
            Flow 2
          </div>
          <div className='p-2 border-l-2 '>
            <img src='././icons/plus-sign.png' width='20px' height='20px' />
          </div>
        </div>
        <div className='flex justify-center items-center pr-2'>
          <img src='././icons/menu.png' onClick={toggleMenu}/>
          <div id='menuTab' className='absolute top-8 right-0 w-64 h-96 color hidden' >
            dsds
          </div>
        </div>
      </div>
      <div id="field" className='flex flex-col overflow-auto mt-10'>
        <canvas ref={canvasRef} className="w-max h-max dark:bg-zinc-900 z-0" width='4000px' height='4000px'></canvas>
        <button className="absolute bottom-0 z-50 text-white px-4 py-2" onClick={svgNodes.clearAllNodes}>
          <img src="././icons/edit.png" alt="Edit" />
        </button>
        <svg id="svg-container" className="absolute flex items-center" width='4000px' height='4000px'></svg>
      </div>
    </div>
    <div id="nodeMenu" className='absolute right-0 w-56 h-full color hidden z-50'>
      <h1>Detailpage</h1>
      <p id="flowEditor"></p>
    </div>
  </div>
</main>
  );
}