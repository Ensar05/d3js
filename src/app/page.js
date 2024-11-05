"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as svgNodes from './svgNodes';
import { categories, buttons } from './flowData';
import Settings from '@/components/settings';
import Menu from '@/components/menu'

let nodesjsonfile = null

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredCategory, setFilteredCategory] = useState(["allgemein", "funktionen"]);
  const [menu, setMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isCustomMenuVisible, setIsCustomMenuVisible] = useState(false);
  const [isExportMenuVisible, setIsExportMenuVisible] = useState(false)
  const [isImportMenuVisible, setIsImportMenuVisible] = useState(false)
  const [isSettingsVisible, setIsSettingsVisible] = useState(false)
  const [blurredBackground, setBlurredBackground] = useState(false)
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [inputJsonText, setInputJsonText] = useState("")
  const [error, setError] = useState("")
  const canvasRef = useRef(null);
  const fieldRef = useRef(null);

  const gridSize = 20;

  useEffect(() => {
    const drawGrid = () => {
      const svg = d3.select(fieldRef.current);
      svg.selectAll("*").remove();  // Clear existing grid
      
      const width = svg.node().clientWidth;
      const height = svg.node().clientHeight;

      const gridColor = darkMode ? '#333' : '#ddd';

      // Draw vertical lines
      for (let x = 0; x < width; x += gridSize) {
        svg.append("line")
          .attr("x1", x)
          .attr("y1", 0)
          .attr("x2", x)
          .attr("y2", height)
          .attr("stroke", gridColor)
          .attr("stroke-width", 1);
      }

      // Draw horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        svg.append("line")
          .attr("x1", 0)
          .attr("y1", y)
          .attr("x2", width)
          .attr("y2", y)
          .attr("stroke", gridColor)
          .attr("stroke-width", 1);
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
            svgNodes.createSVG(svgNodes.nodeId, value, event.x - 306, event.y) //x und y koordinaten noch zu fixen! wenn runter gescrollt wird, sollten sie angepasst werden!
          }
        });
      dragCreate(NodeCreate);

    };
    d3.json('nodes.json').then(data => {
      data.nodes.forEach(node => {
        svgNodes.createSVG(
          svgNodes.nodeId,
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

  const changeBackground = () => {
    setBlurredBackground(!blurredBackground)
  }
  
  const toggleDarkmode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const toggleCategoryDropdown = (selectedCategory) => {
    if (filteredCategory.includes(selectedCategory)) {
      let categories = filteredCategory.filter((e) => e !== selectedCategory);
      setFilteredCategory(categories);
      console.log("ausgeschaltet")
    } else {
      setFilteredCategory([...filteredCategory, selectedCategory]);
      console.log("eingeschaltet")
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
    d3.json('nodes.json').then(function (data) {
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
    const file = new Blob([nodesjsonfile], { type: 'application/json' })

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

  //wenn ImportButton geklickt wird 
  const ImportJson = () => {
    const jsonData = JSON.parse(inputJsonText);

    if (jsonData.nodes) {
      jsonData.nodes.forEach(js => {
        svgNodes.createSVG(svgNodes.nodeId, js.type, js.x, js.y);
      })
    } else {
      setError("Fail")
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonTest = e.target.result
          // const jsonData = JSON.parse(e.target.result)
          // const jsonString = JSON.stringify(jsonData, null, 2)
          setInputJsonText(jsonTest)
          console.log(inputJsonText)
        }
        catch {
          console.log("importieren hat nicht geklappt")
          setInputJsonText(null);
        }
      }
      reader.readAsText(file)
    }
  }

  const handleMouseDown = (event) => {
    if (event.button === 1) {
      event.preventDefault();
      setIsDragging(true)
      setStartPosition({ x: event.clientX - translate.x, y: event.clientY - translate.y });
      console.log("geklickt")
    }
  }

  const handleMouseUp = (event) => {
    if (event.button === 1) {
      console.log("losgelassen")
      setIsDragging(false)
    }
  }

  const handleMouseMove = (event) => {
    if (isDragging) {
      const dx = event.clientX - startPosition.x;
      const dy = event.clientY - startPosition.y;
      setTranslate({ x: dx, y: dy });
    }
  }

  // document.addEventListener('keydown', (e) => {
  //  if (e.key === 'Escape') {
  //   e.preventDefault
  //  } 
  // })

  // style={{ transform: `translate(${translate.x}px, ${translate.y}px)` }}           ref={fieldRef}
  //         onMouseDown={handleMouseDown}
  //         onMouseMove={handleMouseMove}
  //         onMouseUp={handleMouseUp}


  return (
    <main id="FlowEditor" className="flex flex-row">
      <div className={`${blurredBackground ? "fixed z-40 opacity-40 bg-gray-500 h-screen w-full" : "hidden"}`}></div>
      <div id="mainContent" className="flex flex-row flex-grow text-sm">
        <div id="menuDiv" className="h-full flex flex-row items-start z-30 min-w-60 select-none">
          <div className="flex flex-col fixed h-full w-60 p-2 color border-r-2 border-gray-400 dark:bg-zinc-900 dark:text-white dark:border-zinc-800">
            <div className="flex bg-white items-center w-full pl-1">
              <img src='././icons/search.png' className='h-fit' alt="Search" />
              <input type="text" placeholder="Nodes suchen.." onChange={handleSearch} className="h-8 pl-1 outline-0" />
            </div>
            {categories.map((category) => (
              <div key={category.name}>
                <div
                  onClick={() => toggleCategoryDropdown(category.category)}
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
                          onClick={() => svgNodes.createSVG(svgNodes.nodeId, `${button.name}`, 0, 0)}
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
          <div className='flex flex-col color border-r-2 border-gray-400 h-full justify-center items-center'>
            <img id="test" className='opacity-0 transition-opacity duration-300 select-none' src='././icons/bin.png' alt="Bin" />
          </div>
        </div>
        <div id="fieldSide" className="flex flex-col flex-1 select-none overflow-hidden dark:bg-zinc-900">
          <div id="FlowSelektor" className='flex w-full z-30 color'>
            <div className='flex fixed h-10 justify-between w-full color border-b-2 border-gray-400'>
              <div className='flex fixed items-center color '>
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
              <div className='flex fixed right-0 h-10 items-center color pr-2 border-b-2 border-gray-400 cursor-pointer'>
                <img src='././icons/menu.png' className='z-50' onClick={() => { setMenu(!menu) }} />
                <Menu
                  menu={menu}
                  setMenu={setMenu}
                  setIsImportMenuVisible={setIsImportMenuVisible}
                  setIsExportMenuVisible={setIsExportMenuVisible}
                  setIsSettingsVisible={setIsSettingsVisible}
                  isSettingsVisible={isSettingsVisible}
                  setBlurredBackground={setBlurredBackground}
                  toggleExportMenu={toggleExportMenu}
                />
              </div>
            </div>
          </div>
          {isImportMenuVisible && (
            <div className='fixed inset-0 flex justify-center items-center z-50 pointer-none'>
              <div className='w-96 h-96 color p-2 flex flex-col border-gray-400 border-2'>
                <h2 className='pt-2'>Import</h2>
                <textarea className='w-full h-full border-2 border-gray-300 my-2 p-1 rounded overflow-y-scroll select-text cursor-text' value={inputJsonText} onChange={(e) => (setInputJsonText(e.target.value), console.log(inputJsonText))} />
                <div className='w-full select-none'>
                  <button className='bg-gray-200 hover:bg-gray-300 w-fit p-1 border-gray-600 border-2 mr-2' onClick={() => { setIsImportMenuVisible(!isImportMenuVisible), setBlurredBackground(false) }}>Abbrechen</button>
                  <button className='bg-blue-500 hover:bg-blue-600 w-fit p-1 border-gray-600 border-2 mr-2 mb-2 text-white' value="import" onClick={ImportJson}>Import</button>
                  <input id="file" name="file" type="file" accept='.json' onChange={handleFileChange} />
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
              </div>
            </div>
          )}
          {isExportMenuVisible && (
            <div className='fixed inset-0 flex justify-center items-center z-50 pointer-none'>
              <div className='w-96 h-96 color p-2 flex flex-col border-gray-400 border-2'>
                <h2 className='pt-2'>Export</h2>
                <div className='w-full h-full border-2 border-gray-300 my-2 p-1 rounded overflow-y-scroll select-text cursor-text' id="data-container"></div>
                <div className='w-full select-none'>
                  <button className='bg-gray-200 hover:bg-gray-300 w-fit p-1 border-gray-600 border-2 mr-2' onClick={() => { setIsExportMenuVisible(!isExportMenuVisible), setBlurredBackground(false) }}>Abbrechen</button>
                  <button className='bg-blue-500 hover:bg-blue-600 w-fit p-1 border-gray-600 border-2 mr-2 text-white' value="download" onClick={downloadJsonFile}>Download</button>
                  <button className='bg-blue-500 hover:bg-blue-600 w-fit p-1 border-gray-600 border-2 mr-2 text-white' value="download" onClick={copyJsonString}>Kopieren</button>
                </div>
              </div>
            </div>
          )}
          <Settings
            isSettingsVisible={isSettingsVisible}
            setIsSettingsVisible={setIsSettingsVisible}
            setBlurredBackground={setBlurredBackground}
          />
            <div id="field" className="absolute left-60 top-0 right-0 bottom-0 mt-10 overflow-auto">
              <svg
                ref={fieldRef}
                id="svg-container"
                onContextMenu={handleContextMenu}
                onMouseDown={handleMouseDown}b
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                width="4000px"
                height="4000px"
                style={{ transform: `translate(${translate.x}px, ${translate.y}px)` }}
              >
              </svg>
            </div>
          <button className="absolute h-fit bottom-10 left-0 z-50 text-white px-4 py-2" onClick={svgNodes.clearAllNodes}>
            <img src="././icons/edit.png" alt="Edit" />
          </button>
          {isCustomMenuVisible && (
            <div style={{ top: menuPosition.top, left: menuPosition.left }} className="absolute bg-white border color border-gray-400 shadow-md py-1 rounded w-48 left-0">
              <ul>
                <li className="p-2 hover:bg-gray-300 cursor-pointer">Einfügen</li>
                <li className="p-2 hover:bg-gray-300 cursor-pointer" onClick={copyJsonString}>Kopieren</li>
                <li className="p-2 hover:bg-gray-300 cursor-pointer" onClick={() => { setIsExportMenuVisible(!isExportMenuVisible), setIsCustomMenuVisible(!isCustomMenuVisible), toggleExportMenu() }}>Export</li>
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
    </main>
  );
}