import {useState,useContext,useLayoutEffect} from 'react';
import { Spin } from 'antd';
import { getWeather, getForecast } from './api/openWeather';
import moment from 'moment-timezone';
import AppContext from './context/AppContext';
import Card from './components/Card';
import Header from './components/Header';

import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlineDateRange, MdOutlineAccessTime } from "react-icons/md";
import { FiSunset, FiSunrise, FiBarChart2 } from "react-icons/fi";
import { FaTemperatureEmpty, FaDroplet } from "react-icons/fa6";
import { AiFillEyeInvisible } from "react-icons/ai";
import { FaWind, FaCloud, FaGithub } from "react-icons/fa";


import useWindowSize from './hooks/useWindowSize';

const ExtraInfo = ({icon,name,value,unit,theme})=>{
	return (
		<div className={`${theme==='dark' ? 'dark' : ''}`}>
			<div className='rounded-xl w-full px-3 py-2 shadow-lg text-neutral-700 dark:text-indigo-100 bg-white dark:bg-gray-700 flex flex-col items-center gap-1'>
				<div>{icon}</div>
				<div className='flex flex-col items-center'>
					<span>{name}</span>
					<div className=''>{`${value} ${unit}`}</div>
				</div>
			</div>
		</div>
	)
}

const ForecastCard = ({date,minTemp,maxTemp,unit,icon,theme})=>{
	const timeZone = moment.tz.guess();
	return (
		<div className={`${theme==='dark' ? 'dark' : ''}`}>
			<div className='rounded-xl h-full w-44 p-3 shadow-lg bg-white dark:bg-gray-700 flex flex-col items-center gap-3'>
				<div className='text-sm'>{moment.unix(date).tz(timeZone).format('MMM DD, hh:mm a')}</div>
				<img src={`https://openweathermap.org/img/wn/${icon}@4x.png`} alt="can't load image" className={`${(theme==='dark' ||  icon==='01d') ? ' brightness-125' : ' brightness-90'} object-none object-center h-28 w-36`}/>
				<div className='flex flex-col items-center'>
					<div className='flex items-center gap-2'>
						<span className='text-sm text-black/50 dark:text-white/50'>min</span>
						<span>{`${minTemp} \u00B0${unit}`}</span>
					</div>
					<div className='flex items-center gap-2'>
						<span className='text-sm text-black/50 dark:text-white/50'>max</span>
						<span>{`${maxTemp} \u00B0${unit}`}</span>
					</div>
				</div>
			</div>
		</div>
	)
}


const App = () => {
	const {location,unit,theme} = useContext(AppContext);
	const [weatherData,setWeatherData] = useState(null);
	const [forecast,setForecast] = useState(null);
	const [loading,setLoading] = useState(false);
	const timeZone = moment.tz.guess();

	// const [places,setPlaces] = useState(null);

	const {isMobile,isTablet,isDesktop} = useWindowSize();

	useLayoutEffect(()=>{
		;(async ()=>{
			try{
				setLoading(true);
				const weather = await getWeather(location,unit);
				setWeatherData(weather);
				// console.log(weather);
				const forecast = await getForecast(location,unit);
				setForecast(forecast);
				// console.log(forecast);
			}catch(err){
				console.log(err);
			}finally{
				setLoading(false);
			}
		})()
	},[location,unit])

	return (
		<div className={`${theme=='dark' ? 'dark' : ''}`}>
			<div className='transition-all duration-300 min-h-screen min-w-full bg-indigo-100 dark:bg-gray-900 text-black dark:text-white px-6 py-2 sm:px-10 sm:py-4 md:px-14 md:py-6 lg:px-20 lg:py-9 xl:px-24 xl:py-11'>
				<Header/>
				<Card>
					{(!loading && weatherData && forecast?.list?.length>0) ? <div className='flex flex-col items-center justify-evenly gap-2 w-full'>
						{/* conditional location header >=xl */}
						{isDesktop ? <div className='flex flex-col justify-evenly gap-1 w-full'>
							<div className='text-xl md:text-2xl font-semibold flex gap-1 items-center justify-center md:justify-start'>
								<HiOutlineLocationMarker/>
								<span>{location?.address}</span>
							</div>
							{weatherData ? <div className='text-black/60 dark:text-white/60 flex gap-4 items-center justify-center md:justify-start'>
								<div className='flex gap-1 items-center'>
									<MdOutlineDateRange/>
									<span>{moment.unix(weatherData?.dt).tz(timeZone).format('MMM DD, YYYY')}</span>
								</div>
								<div className='flex gap-1 items-center'>
									<MdOutlineAccessTime/>
									<span>{moment.unix(weatherData?.dt).tz(timeZone).format('hh:mm a')}</span>
								</div>
							</div> : null}
						</div> : null}

						{/* cards */}
						<div className='w-full xl:mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
							{/* conditional location card for <xl*/}
							{!isDesktop ? <div className='w-full rounded-xl bg-indigo-100 shadow-lg dark:bg-slate-500 h-40 md:h-64 p-6 flex flex-col items-center justify-center gap-2'>
								<div className='flex gap-1 items-start justify-center max-w-56'>
									<HiOutlineLocationMarker size={46}/>
									<div className='flex flex-col items-start justify-center'>
										<span className='text-4xl font-bold'>{`${location?.address?.split(', ')[0]}`}</span>
										<span>{`${location?.address?.split(', ')[1]}, ${location?.address?.split(', ')[2]}`}</span>
										<span>{``}</span>
									</div>
								</div>
								{weatherData ? <div className='text-black/60 dark:text-white/60 flex gap-3 items-center justify-center'>
									<div className='flex gap-1 items-center'>
										<MdOutlineDateRange/>
										<span>{moment.unix(weatherData?.dt).tz(timeZone).format('MMM DD, YYYY')}</span>
									</div>
									<div className='flex gap-1 items-center'>
										<MdOutlineAccessTime/>
										<span>{moment.unix(weatherData?.dt).tz(timeZone).format('hh:mm a')}</span>
									</div>
								</div> : null}
							</div> : null}

							{/* weather card */}
							{weatherData ? <div className='w-full rounded-xl bg-indigo-100 shadow-lg dark:bg-slate-500 h-52 sm:h-64 p-5 flex flex-col justify-between overflow-hidden'>
								<div className='flex items-end justify-between w-full'>
									<div className='text-2xl sm:text-4xl font-bold h-full flex items-center text-black/70 dark:text-white'>
										<FaTemperatureEmpty/>
										{`${weatherData?.main?.temp} \u00B0${unit}`}
									</div>
									<div className='flex flex-col items-start justify-center'>
										<div>
											<span className='text-sm text-black/60 dark:text-white/60'>Low </span>
											<span className='font-bold text-black/70 dark:text-white'>{`${weatherData?.main?.temp_min} \u00B0${unit}`}</span>
										</div>
										<div>
											<span className='text-sm text-black/60 dark:text-white/60'>High </span>
											<span className='font-bold text-black/70 dark:text-white'>{`${weatherData?.main?.temp_max} \u00B0${unit}`}</span>
										</div>
									</div>
								</div>
								<div className='flex items-end justify-between w-full relative'>
									<div className='flex flex-col items-start justify-center'>
										{weatherData?.weather?.length>0 && <div>{`${weatherData?.weather[0]?.main}`}</div>}
										<div className=''>
											<span className='text-sm text-black/50 dark:text-white/50'>Feels Like </span>
											<span className='text-black dark:text-white'>{`${weatherData?.main?.feels_like} \u00B0${unit}`}</span>
										</div>
									</div>
									{weatherData?.weather?.length>0 && <img src={`https://openweathermap.org/img/wn/${weatherData?.weather[0]?.icon}@4x.png`} alt="can't load image" className={` absolute bottom-[-10px] right-[-20px] md:right-[-10px] ${(theme==='dark' ||  weatherData?.weather[0]?.icon==='01d') ? ' brightness-125' : ' brightness-90'} object-none object-center h-28 w-36`}/>}
								</div>
							</div> : null}

							{/* sunrise-sunset info card */}
							{weatherData ? <div className='relative overflow-hidden w-full rounded-xl bg-indigo-100 shadow-lg dark:bg-slate-500 h-52 sm:h-64 p-5 flex items-center gap-10 justify-evenly'>
								<img src={'https://i.pinimg.com/736x/63/44/fb/6344fb46661e5886aa86f53b11d6c6cb.jpg'} alt="" className={`w-full absolute bottom-0 left-0 z-0 opacity-70 brightness-90 dark:brightness-50`}/>
								<div className={`flex flex-col items-center z-10 text-black/70 dark:text-white`}>
									<FiSunrise size={60}/>
									<span className='text-2xl font-bold'>Sunrise</span>
									<span>{moment.unix(weatherData?.sys?.sunrise).tz(timeZone).format('hh:mm a')}</span>
								</div>
								<div className={`flex flex-col items-center z-10 text-black/70 dark:text-white`}>
									<FiSunset size={60}/>
									<span className='text-2xl font-bold'>Sunset</span>
									<span>{moment.unix(weatherData?.sys?.sunset).tz(timeZone).format('hh:mm a')}</span>
								</div>
							</div> : null}

							{/* extra weather info card */}
							{weatherData ? <div className='w-full rounded-xl bg-indigo-100 shadow-lg dark:bg-slate-500 h-64 p-3 sm:p-5 grid grid-cols-3 content-center gap-2 text-sm'>
								<div className='col-span-2'>
									<ExtraInfo icon={<FaDroplet size={25}/>} name='Humidity' value={weatherData?.main?.humidity} unit='%' theme={theme}/>
								</div>
								<ExtraInfo icon={<FaCloud size={25}/>} name='Clouds' value={weatherData?.clouds?.all} unit='%' theme={theme}/>
								<ExtraInfo icon={<FiBarChart2 size={25}/>} name='Pressure' value={weatherData?.main?.pressure} unit='hPa' theme={theme}/>
								<ExtraInfo icon={<AiFillEyeInvisible size={25}/>} name='Visibility' value={weatherData?.visibility} unit='m' theme={theme}/>
								<ExtraInfo icon={<FaWind size={25}/>} name='Wind' value={weatherData?.wind?.speed} unit='m/s' theme={theme}/>
							</div> : null}

							{/* forecast card */}
							{forecast ? <div className='w-full rounded-xl bg-indigo-100 shadow-lg dark:bg-slate-500 md:col-span-2 xl:col-span-3 p-5 '>
								<div className='flex items-center gap-2 overflow-x-scroll rounded-xl scrollbar scrollbar-padding-2 scrollbar-thumb-rounded-full scrollbar-thumb-gray-100 scrollbar-track-indigo-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-slate-500'>
									{forecast?.list?.map(item=>(
										<ForecastCard key={item?.dt} date={item?.dt} minTemp={item?.main?.temp_min} maxTemp={item?.main?.temp_max} unit={unit} icon={item?.weather[0]?.icon} theme={theme}/>
									))}
								</div>
							</div> : null}
						</div>
					</div> : (loading ? <div className='flex items-center justify-center h-[50vh] w-full'><Spin size='large'/></div> : 
					<div className='flex items-center justify-center h-[50vh] w-full'>Unable to fetch loaction info...</div>)}
				</Card>
			</div>
		</div>
	)
}
export default App;