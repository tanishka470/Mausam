import {useContext, useState} from 'react';
import { Modal, ConfigProvider } from 'antd';
import useWindowSize from '../hooks/useWindowSize';
import { TiWeatherCloudy } from "react-icons/ti";
import { FaCode, FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa6";
import AppContext from '../context/AppContext';
import DevLogo from '../assets/dev.png';

import SearchBar from './SearchBar';
import CustomSwitch from './CustomSwitch'

const Header = () => {
    const {theme,setTheme,unit,setUnit} = useContext(AppContext)
    const {isMobile,isTablet,isDesktop} = useWindowSize();
    const [modalOpen, setModalOpen] = useState(false);

    const linkRedirect = (link)=>{
        window.open(link, '_blank');
    }

    return (
        <div className={`${theme==='dark' ? 'dark' : ''}`}>
            <div className={`flex ${isMobile ? "flex-col gap-4" : "flex-row"} items-center justify-between w-full px-0 py-3`}>
                <div className='flex items-center justify-evenly gap-1 rounded-[15px] hover:bg-white hover:shadow-lg dark:hover:bg-gray-700 hover:px-3 cursor-pointer transition-all duration-200' onClick={()=>setModalOpen(true)}>
                    <TiWeatherCloudy size={40}/>
                    <div className='text-2xl'>Weather</div>
                    {!isMobile && <div className='text-lg ml-2 text-gray-500 dark:text-gray-400'>by Tanishka</div>}
                </div>
                <div className={`flex flex-col md:flex-row items-center w-4/5 md:w-3/5 lg:w-1/2 xl:w-2/5 justify-between md:justify-end gap-2`}>
                    <div className='w-full'>
                        <SearchBar/>
                    </div>
                    <div className='flex gap-2 items-center justify-end'>
                        <CustomSwitch currOption={unit} setOption={setUnit} options={['C','F']}/>
                        <CustomSwitch currOption={theme} setOption={setTheme} options={['dark','light']}/>
                    </div>
                </div>
            </div>
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
                    <Modal
                        title={null}
                        open={modalOpen}
                        onCancel={()=>setModalOpen(false)}
                        onClose={()=>setModalOpen(false)}
                        footer={null}
                        centered
                        width='fit-content'
                        styles={{
                            content: {
                                border: theme==='dark' ? '1px solid #c7c7c7' : '',
                                display:'flex',
                                justifyContent:'center', 
                                alignItems:'center',
                            }
                        }}    
                    >
                        <div className='h-full w-full flex flex-col items-center justify-center text-center gap-4'>
                            <img src={DevLogo} alt='dev logo' className='h-32 w-32'/>
                            <div className='text-center text-xl flex flex-col items-center justify-center gap-1'>
                                <span className=''>This project is developed and maintained by</span>
                                <span className='font-bold text-2xl'>Tanishka Sharma</span>
                            </div>
                            <div className='w-full flex items-center justify-center gap-2 flex-wrap'>
                                <div
                                    className='transition-all duration-200 flex items-center justify-center text-center gap-2 rounded-full p-1 bg-white text-black border-2 border-white cursor-pointer hover:p-2 hover:bg-gray-700 hover:text-white'
                                    onClick={()=>linkRedirect('https://github.com/tanishka470')}
                                >
                                    <FaGithub size={18}/>
                                    <div>GitHub</div>
                                </div>
                            </div>
                            <p className='mt-4'>
                                This weather application is built using React.js, Tailwind CSS and Ant Design.
                                <br/>And is powered by OpenWeather + Geoapify APIs.
                            </p>
                            <div className='flex items-center justify-center gap-1'>
                                <FaGithub size={18}/>
                                <span>Source Code: </span>
                                <a href="https://github.com/tanishka470/weather-AD" target='_blank' className={`${theme==='dark' ? 'text-indigo-400' : 'text-indigo-500'} hover:underline`}>github.com/tanishka470/weather-AD</a>
                            </div>
                        </div>
                    </Modal>
                </div>
            </ConfigProvider>
        </div>
    )
}

export default Header