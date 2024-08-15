"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as svgNodes from './svgNodes';
import { categories, buttons } from './flowData';

export default function Home() {
  const [isVisible, setIsVisible] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredButtons, setFilteredButtons] = useState(buttons);
  const [filteredCategory, setFilteredCategory] = useState([]);
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
      console.log(filteredCategory)
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
    console.log(selectedCategory)
    if (filteredCategory.includes(selectedCategory)) {
      let categories = filteredCategory.filter((e) => e !== selectedCategory);
      setFilteredCategory(categories)
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value.toLowerCase());
    console.log(search)
  }

  const searchedButtons = buttons.filter(button =>
    button.value.includes(search)
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-y-hidden">
      <div className="flex w-full h-full text-sm">
        <div className="menuDiv flex flex-col items-start min-h-screen w-60 p-2 color dark:bg-zinc-900 dark:text-white dark:border-zinc-800 select-none">
          <div className='flex bg-white items-center w-full pl-1'><img src='././icons/search.png' className='h-fit'/><input type="text" placeholder="Nodes suchen.." onChange={handleSearch} className="h-8 pl-1 border-0 outline-0"/></div>    
            {categories && 
              categories.map(category => (<div onClick={() => toggleDropdown(category.category)} className={`block text-lg font-bold my-1 cursor-pointer ${filteredCategory?.includes(category.category) ? "active" : ""}`} value={category.category}>{category.name}</div>
              ))}
              <div className="nodeDropdown">
                {searchedButtons.map(button => (
                  <button
                    value={button.value}
                    onClick={createSVG => svgNodes.createSVG(d3.select('#svg-container'), `${button.name}`, `${button.color}`, darkMode)}
                    className={`block ${button.bgColor} text-white px-4 py-2 rounded mb-2`}>
                    {button.name}
                  </button>
                ))}
              </div>
          <label className="mt-auto flex">
            <input type="checkbox" className="sr-only peer" onChange={toggleDarkmode} />
            <p>{darkMode ? 'Lichtmodus aktivieren' : 'Dunkelmodus aktivieren'}</p>
            <div className="relative ml-1 w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="slider round"></span>
          </label>
        </div>
        <div id="deletebar" className='flex items-center color dark:bg-zinc-900'>
          <img id="test" className='opacity-0 transition-opacity duration-300 select-none' src='././icons/bin.png' />
        </div>
        <div className="flex-1 relative flex select-none">
          <canvas ref={canvasRef} className="w-full h-full dark:bg-zinc-900 z-0"></canvas>
          <button className="absolute bottom-0 z-50 text-white px-4 py-2" onClick={svgNodes.clearAllNodes}>
            <img src="././icons/edit.png" />
          </button>
          <svg id="svg-container" className="absolute inset-0 flex items-center w-full h-full z-0"></svg>
        </div>
        <div id="nodeMenu" className='absolute right-0 w-56 h-full color opacity-0'><h1>Detailpage</h1><p id="flowEditor"></p></div>
      </div>
    </main>
  );
}
