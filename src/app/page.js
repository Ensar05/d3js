"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as svgNodes from './svgNodes';
import { categories, buttons } from './flowData';
import drag from './svgNodes';

let nodesjsonfile = null

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredCategory, setFilteredCategory] = useState(["allgemein", "funktionen"]);
  const [menu, setMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isCustomMenuVisible, setIsCustomMenuVisible] = useState(false);
  const [isExportMenuVisible, setIsExportMenuVisible] = useState(false)
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
            svgNodes.createSVG(value, event.x - 306, event.y) //x und y koordinaten noch zu fixen! wenn runter gescrollt wird, sollten sie angepasst werden!
          }
        });

      dragCreate(NodeCreate);

    };
    d3.json('nodes.json').then(data => {
        data.nodes.forEach(node => {
          svgNodes.createSVG(
            node.type,
            node.x,       
            node.y          
          );
        });
    }).catch(error => {
      console.error("Fehler beim Laden der JSON-Datei:", error);
    });
    //kopieren bei customMenu geht dann wieder aber es gibt fehler beim neuladen toggleExportMenu();

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

  d3.select('#svg-container').on("click", () => {
    setMenu(false)
    setIsCustomMenuVisible(false)
    setIsExportMenuVisible(false)
    console.log("clicked")
  })

  const handleContextMenu = (event) => {
    event.preventDefault();
    setMenuPosition({
      top: event.pageY,
      left: event.pageX - 240,
    });
    setIsCustomMenuVisible(true);
  };


  const toggleExportMenu = () => {
    d3.json('nodes.json').then(function(data) {
      const nodesjson = JSON.stringify(data)
      nodesjsonfile = nodesjson
      
      const container = d3.select('#data-container');
      const div = document.createElement('div');
      div.textContent = nodesjson;
      container.node().appendChild(div);
    }).catch(error => {
      console.error('Error loading JSON:', error);
    });
  }

  const downloadJsonFile = () => {
    const file = new Blob([nodesjsonfile], {type: 'application/json'})

    const link = document.createElement('a');
    link.href = URL.createObjectURL(file)
    link.download = "Flow.json"

    link.click()
  }

  const copyJsonString = () => {
    navigator.clipboard.writeText(nodesjsonfile);
    if (isCustomMenuVisible === true) {
      setIsCustomMenuVisible(!isCustomMenuVisible)
    } 
    if (isExportMenuVisible === true) {
      setIsExportMenuVisible(!isExportMenuVisible)
    }
    alert("Die Json File wurde in die Zwischenablage kopiert!")
  }

  // const svgContainer = document.getElementById("svg-container")
  // svgContainer.addEventListener("mousedown", function(event) {
  //   if (event.button === 1) {
  //     console.log("Mausrad gedrückt");
  //     event.preventDefault();
  //   }
  // });

  return (
    <main id="FlowEditor" className="flex overflow-hidden">
      <div className="flex flex-col w-full h-full text-sm">
        <div className="menuDiv fixed h-screen flex flex-row items-start z-40 w-60 p-2 color border-r-2 border-gray-400 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 select-none">
          <div className='flex flex-col h-full'>
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
                          onClick={() => svgNodes.createSVG( `${button.name}`,  0, 0)}
                          className={`Button block ${button.bgColor} text-white px-4 py-2 rounded mb-2`}
                        >
                          {button.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}
            <label className="mt-auto flex justify-center items-center">
              <input type="checkbox" className="sr-only peer" onChange={toggleDarkmode} />
              <p>{darkMode ? 'Lichtmodus aktivieren' : 'Dunkelmodus aktivieren'}</p>
              <div className="relative ml-1 w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className='flex flex-col h-full justify-center items-center'>
            <img id="test" className='opacity-0 transition-opacity duration-300 select-none' src='././icons/bin.png' alt="Bin" />
          </div>
        </div>

        <div id="fieldSide" className="flex flex-col w-full relative select-none ml-60">
          <div id="FlowSelektor" className='flex fixed w-screen z-50 h-10 color border-b-2 border-gray-400 justify-between'>
            <div className='flex items-center'>
              <div className='ml-3 p-2 pr-16 border-x-2 border-t-2 border-gray-400 cursor-pointer'>
                Flow 1
              </div>
              <div className='ml-2 p-2 pr-16 border-x-2 border-t-2 border-gray-400'>
                Flow 2
              </div>
              <div className='p-2 border-l-2 cursor-pointer'>
                <img src='././icons/plus-sign.png' width='20px' height='20px' />
              </div>
            </div>
            <div className='flex fixed right-0 h-10 items-center pr-2 cursor-pointer'>
              <img src='././icons/menu.png' className='z-100' onClick={() => {setMenu(!menu)}} />
              {menu && (
              <div id='menuTab' className='absolute top-10 right-0 w-64 h-96 color text-base border-gray-400 border-l-2 border-b-2'>
                <div className='flex flex-col p-1 pl-2 h-full'>
                  <a className='hover:bg-gray-300'>Bearbeiten</a>
                  <a className='hover:bg-gray-300'>Ansicht</a>
                  <hr className='border-t-2 border-gray-400 my-2' />
                  <a className='hover:bg-gray-300'>Import</a>
                  <a className='hover:bg-gray-300' onClick={() => {setIsExportMenuVisible(!isExportMenuVisible), setMenu(!menu), toggleExportMenu()}}>Export</a>
                  <hr className='border-t-2 border-gray-400 my-2' />
                  <a className='hover:bg-gray-300'>Einstellungen</a>
                  <a className='mt-auto'>v1.0.0</a>
                </div>
              </div>)}
              {isExportMenuVisible && (
                <div className='fixed inset-0 flex justify-center items-center z-50 pointer-none'>
                  <div className='w-96 h-96 color p-2 flex flex-col border-gray-400 border-2'>
                    <h2 className='pt-2'>Export</h2>
                    <div className='w-full h-full border-2 border-gray-300 my-2 p-1 rounded overflow-y-scroll select-text cursor-text' id="data-container"></div>
                    <div className='w-full select-none'>
                      <button className='bg-gray-200 hover:bg-gray-300 w-fit p-1 border-gray-600 border-2 mr-2' onClick={() => setIsExportMenuVisible(!isExportMenuVisible)}>Abbrechen</button>
                      <button className='bg-blue-500 hover:bg-blue-600 w-fit p-1 border-gray-600 border-2 mr-2 text-white' value="download" onClick={downloadJsonFile}>Download</button>
                      <button className='bg-blue-500 hover:bg-blue-600 w-fit p-1 border-gray-600 border-2 mr-2 text-white' value="download" onClick={copyJsonString}>Kopieren</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div id="field" className='flex flex-col overflow-auto mt-10'>
            <canvas ref={canvasRef} className="w-max h-max dark:bg-zinc-900 z-0" width='4000px' height='4000px'></canvas>
            <button className="absolute bottom-0 left-0 z-50 text-white px-4 py-2" onClick={svgNodes.clearAllNodes}>
              <img src="././icons/edit.png" alt="Edit" />
            </button>
            <svg id="svg-container" onContextMenu={handleContextMenu} onMouseDown={(e) => {e.preventDefault(); if(event.button === 1) { console.log("geklickt")}}} className="absolute flex items-center" width='4000px' height='4000px'></svg>
            {isCustomMenuVisible && (
              <div
                style={{ top: menuPosition.top, left: menuPosition.left }}
                className="absolute bg-white border color border-gray-400 shadow-md py-1 rounded w-48 left-0"
              >
                <ul>
                  <li className="p-2 hover:bg-gray-300 cursor-pointer">Einfügen</li>
                  <li className="p-2 hover:bg-gray-300 cursor-pointer" onClick={copyJsonString}>Kopieren</li>
                  <li className="p-2 hover:bg-gray-300 cursor-pointer" onClick={() => {setIsExportMenuVisible(!isExportMenuVisible), setIsCustomMenuVisible(!isCustomMenuVisible), toggleExportMenu()}}>Export</li>
                  <li className="p-2 hover:bg-gray-300 cursor-pointer">Alles Auswählen</li>
                </ul>
              </div>
            )}
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