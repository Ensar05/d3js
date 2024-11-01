import React, {useState} from "react"

export default function Settings({ isSettingsVisible, setIsSettingsVisible, setBlurredBackground }) {
    const [selectedSettings, setSelectedSettings] = useState("hotkeys")
    return (
      <>
        {isSettingsVisible && (
        <div className='fixed flex flex-col w-[500px] h-full color border-gray-400 border-2 top-10 right-0 z-50 pointer-none'>
          <div className='flex flex-row w-full border-b-2 border-gray-400'>
            <h2 className='p-2 w-full'>Einstellungen</h2>
          </div>
          <div className='flex w-full h-full flex-row text-base border-b-2 border-gray-400'>
            <div className='h-full w-44 border-r-2 border-gray-400 flex flex-col items-start'>
              <a className='flex h-10 w-full items-center bg-zinc-200 hover:bg-zinc-300 p-2 border-b-2 border-gray-400' onClick={() => { setSelectedSettings("hotkeys") }}>Hotkeys</a>
              <a className='flex h-10 w-full items-center bg-zinc-200 hover:bg-zinc-300 p-2 border-b-2 border-gray-400' onClick={() => { setSelectedSettings("pakete") }}>Pakete</a>
              <a className='flex h-10 w-full items-center bg-zinc-200 hover:bg-zinc-300 p-2 border-b-2 border-gray-400' onClick={() => { setSelectedSettings("anderes") }}>Anderes</a>
            </div>
            <div className='w-full h-full bg-white'>
              <div className={` ${selectedSettings === 'hotkeys' ? 'block' : 'hidden'} flex flex-col h-full`}><div className="w-full border border-b-2 flex"><p className='w-1/2 h-fit pl-1'>Beschreibung</p><p className='w-1/2 h-full'>Tastenbelegung</p></div></div>
              <div className={` ${selectedSettings === 'pakete' ? 'block' : 'hidden'}`}><input type="text" placeholder="Pakete suchen.." className="h-8 pl-1 outline-0" /></div>
              <div className={` ${selectedSettings === 'anderes' ? 'block' : 'hidden'}`}>test3</div>
            </div>
          </div>
          <div className='w-full h-24 select-none p-2'>
            <button className='bg-red-700 hover:bg-red-600 text-gray-200 border-red-900 border-2 mr-2 p-1' onClick={() => { setIsSettingsVisible(!isSettingsVisible), setBlurredBackground(false) }}>Abbrechen</button>
          </div>
        </div>
        )}
      </>
    )
}