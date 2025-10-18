import React, { useContext, useState } from 'react'
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import useWindowSize from '../hooks/useWindowSize';
import AppContext from '../context/AppContext';


const CustomSwitch = ({currOption,setOption,options=[]}) => {
    const {theme} = useContext(AppContext);
    const {isMobile} = useWindowSize();

    return (
        <div className={`${theme==='dark' ? 'dark' : ''}`}>
            <div className='rounded-2xl shadow-xl bg-white dark:bg-gray-600 dark:text-white flex items-center justify-center w-fit'>
                {options.map(option=>(
                    <div
                    key={option}
                    className={`${currOption===option ? "bg-indigo-400 text-white" : "bg-white dark:bg-gray-600"} px-1 h-8 w-10 text-sm rounded-2xl flex items-center justify-center cursor-pointer`} 
                    onClick={()=>setOption(option)}
                    >
                        {option==='dark' ? <MdOutlineDarkMode/> : null}
                        {option==='light' ? <MdOutlineLightMode/> : null}
                        {option==='C' ? '\u00B0C' : null}
                        {option==='F' ? '\u00B0F' : null}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CustomSwitch