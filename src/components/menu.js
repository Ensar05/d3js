import React, {useState} from "react"

export default function Menu({ menu, setMenu, setIsImportMenuVisible,setIsExportMenuVisible,setIsSettingsVisible,setBlurredBackground,toggleExportMenu, isSettingsVisible, isImportMenuVisible, isExportMenuVisible}) {
    return (
        <>
        {menu && (
            <div id='menuTab' className='absolute top-10 right-0 w-64 h-96 color text-base border-gray-400 border-l-2 border-b-2'>
              <div className='flex flex-col p-1 pl-2 h-full'>
                <a className='hover:bg-gray-300'>Bearbeiten</a>
                <a className='hover:bg-gray-300'>Ansicht</a>
                <hr className='border-t-2 border-gray-400 my-2' />
                <a className='hover:bg-gray-300' onClick={() => { setIsImportMenuVisible(!isImportMenuVisible), setMenu(!menu), setBlurredBackground(true) }}>Import</a>
                <a className='hover:bg-gray-300' onClick={() => { setIsExportMenuVisible(!isExportMenuVisible), setMenu(!menu), setBlurredBackground(true), toggleExportMenu() }}>Export</a>
                <hr className='border-t-2 border-gray-400 my-2' />
                <a className='hover:bg-gray-300' onClick={() => { setIsSettingsVisible(!isSettingsVisible), setMenu(!menu), setBlurredBackground(true)}}>Einstellungen</a>
                <a className='mt-auto'>v1.0.0</a>
              </div>
            </div>)}
        </>
    )
}