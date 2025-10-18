import React, { useContext, useEffect, useId, useState } from 'react'
import { v4 as uuid } from 'uuid';
import { Select, Spin, ConfigProvider } from 'antd'
import debounce from 'lodash/debounce';
import AppContext from '../context/AppContext'
import { geocode, reverseGeocode } from '../api/geoCoding'
import useWindowSize from '../hooks/useWindowSize';

import { IoLocation } from "react-icons/io5";

const SearchBar = () => {
    const {location,setLocation,theme} = useContext(AppContext);
    const [options,setOptions] = useState([]);
    const [loading,setLoading] = useState(false);
    const {isMobile} = useWindowSize();
    const { Option } = Select;


    const searchWithDebounce = debounce(async (text)=>{
        if(text?.length>3){
            setLoading(true);
            const res = await geocode(text);
            setOptions(res);
            setLoading(false);
        } else {
            setOptions([]);
        }
    },700);

    const selectHandler = (value) => {
        const obj = JSON.parse(value);
        setLocation(obj);
        localStorage.setItem('location',value);
    }

    const fetchCurrentLocation = () => {
        if('geolocation' in navigator){
            navigator.geolocation.getCurrentPosition(async (currLocation)=>{
                const lat = currLocation.coords.latitude;
                const lon = currLocation.coords.longitude;
                try {
                    const res = await reverseGeocode(lat,lon);
                    if(res){
                        setLocation(res);
                        localStorage.setItem('location',JSON.stringify(res));
                    }
                } catch (error) {
                    console.log('Error!');
                }
            });
        } else{
            console.log('Geolocation not available');
        }
    }
    
    return (
        <ConfigProvider
        theme={{
            components: {
                Select: {
                    optionSelectedBg:`${theme==='dark' ? '#6366f1' : '#c7d2fe'}`,
                }
            },
            token:{
                colorText:`${theme==='dark' ? 'white' : 'black'}`,
                colorTextPlaceholder:`${theme==='dark' ? '#afb7c4' : '#494949'}`,
                colorBorder:'#818cf8',
                colorBorderHover:'#06b6d4',
                controlOutlineWidth:0,
                colorBgContainer:`${theme==='dark' ? '#0f172a' : 'white'}`,
                colorBgElevated:`${theme==='dark' ? '#1f2937' : 'white'}`,
                borderRadius:'15px',
            }
        }}
        >
            <div className='flex items-center gap-1 w-full'>
                <Select
                    showSearch
                    placeholder="Enter a location"
                    notFoundContent={loading ? <Spin size="small" /> : null}
                    filterOption={false}
                    onSearch={searchWithDebounce}
                    onSelect={selectHandler}
                    className='w-full h-[30px] rounded-[15px] flex items-center justify-center text-center'
                >
                    {options.map((option) => (
                        <Option key={uuid()} value={JSON.stringify(option.value)}>
                            {option.label}
                        </Option>
                    ))}
                </Select>
                <button onClick={fetchCurrentLocation} className='flex items-center justify-center rounded-[15px] text-white bg-indigo-400 px-2 py-1 h-[28px]'>
                    <IoLocation/>
                </button>
            </div>
        </ConfigProvider>
    )
}

export default SearchBar;