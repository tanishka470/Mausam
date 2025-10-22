import React, { useState, useContext, useEffect } from 'react';
import { getForecast } from '../api/openWeather';
import AppContext from '../context/AppContext';
import { Spin, Collapse, Card as AntCard } from 'antd';
import moment from 'moment-timezone';
import { 
    LineChart, Line, BarChart, Bar, AreaChart, Area, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart
} from 'recharts';
import { 
    WiThermometer, WiHumidity, WiStrongWind, WiRaindrop, 
    WiBarometer, WiCloud, WiDaySunny, WiNightClear 
} from 'react-icons/wi';
import { FiSunrise, FiSunset, FiCalendar } from 'react-icons/fi';
import { BsCloudRainHeavy, BsDropletFill } from 'react-icons/bs';
import { TbTemperature } from 'react-icons/tb';

const { Panel } = Collapse;

const DetailedForecast = ({ theme }) => {
    const { location, unit } = useContext(AppContext);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const timeZone = moment.tz.guess();

    useEffect(() => {
        const fetchForecast = async () => {
            if (!location) return;
            
            console.log('Fetching forecast for location:', location?.address);
            setLoading(true);
            try {
                const data = await getForecast(location, unit);
                setForecastData(data);
                console.log('Forecast data received:', data);
            } catch (error) {
                console.error('Error fetching forecast:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, [location, unit]);

    // Group forecast by day
    const groupByDay = () => {
        if (!forecastData?.list) return [];

        const grouped = {};
        forecastData.list.forEach((item) => {
            const date = moment.unix(item.dt).tz(timeZone).format('YYYY-MM-DD');
            if (!grouped[date]) {
                grouped[date] = {
                    date,
                    items: [],
                    dayName: moment.unix(item.dt).tz(timeZone).format('dddd'),
                    dateFormatted: moment.unix(item.dt).tz(timeZone).format('MMM DD, YYYY'),
                };
            }
            grouped[date].items.push(item);
        });

        // Calculate daily stats
        return Object.values(grouped).map((day) => {
            const temps = day.items.map(i => i.main.temp);
            const minTemp = Math.min(...temps);
            const maxTemp = Math.max(...temps);
            const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
            
            const humidity = day.items.map(i => i.main.humidity);
            const avgHumidity = Math.round(humidity.reduce((a, b) => a + b, 0) / humidity.length);
            
            const wind = day.items.map(i => i.wind.speed);
            const avgWind = (wind.reduce((a, b) => a + b, 0) / wind.length).toFixed(1);
            
            const pressure = day.items.map(i => i.main.pressure);
            const avgPressure = Math.round(pressure.reduce((a, b) => a + b, 0) / pressure.length);
            
            // Precipitation probability (pop = probability of precipitation)
            const pop = day.items.map(i => i.pop * 100);
            const avgPop = Math.round(pop.reduce((a, b) => a + b, 0) / pop.length);
            
            // Get most common weather condition
            const weatherCounts = {};
            day.items.forEach(i => {
                const main = i.weather[0].main;
                weatherCounts[main] = (weatherCounts[main] || 0) + 1;
            });
            const dominantWeather = Object.keys(weatherCounts).reduce((a, b) => 
                weatherCounts[a] > weatherCounts[b] ? a : b
            );
            
            const icon = day.items[Math.floor(day.items.length / 2)].weather[0].icon;

            return {
                ...day,
                minTemp,
                maxTemp,
                avgTemp: parseFloat(avgTemp),
                avgHumidity,
                avgWind: parseFloat(avgWind),
                avgPressure,
                avgPop,
                dominantWeather,
                icon,
            };
        }).slice(0, 7); // Limit to 7 days
    };

    const dailyData = groupByDay();

    // Prepare data for weekly overview chart
    const weeklyChartData = dailyData.map(day => ({
        day: day.dayName.substring(0, 3),
        date: moment(day.date).format('MM/DD'),
        min: day.minTemp,
        max: day.maxTemp,
        avg: day.avgTemp,
        humidity: day.avgHumidity,
        wind: day.avgWind,
        precipitation: day.avgPop,
    }));

    // Prepare hourly data for selected day
    const getHourlyData = (dayData) => {
        if (!dayData) return [];
        return dayData.items.map(item => ({
            time: moment.unix(item.dt).tz(timeZone).format('HH:mm'),
            timeFormatted: moment.unix(item.dt).tz(timeZone).format('hh:mm A'),
            temp: item.main.temp,
            feels_like: item.main.feels_like,
            humidity: item.main.humidity,
            wind: item.wind.speed,
            precipitation: item.pop * 100,
            pressure: item.main.pressure,
            clouds: item.clouds.all,
            weather: item.weather[0].main,
            icon: item.weather[0].icon,
        }));
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className='bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700'>
                    <p className='font-semibold text-gray-800 dark:text-white mb-2'>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className='text-sm'>
                            {entry.name}: {entry.value}{entry.unit || ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-[400px]'>
                <Spin size='large' />
            </div>
        );
    }

    if (!forecastData || dailyData.length === 0) {
        return (
            <div className='text-center py-12'>
                <FiCalendar size={64} className='mx-auto text-gray-400 mb-4' />
                <h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                    No Forecast Data Available
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                    Unable to load forecast for the selected location
                </p>
            </div>
        );
    }

    return (
        <div className={`${theme === 'dark' ? 'dark' : ''}`}>
            <div className='space-y-6'>
                {/* Header */}
                <div className='glass dark:glass-dark rounded-3xl p-6'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-3'>
                            <FiCalendar size={32} className='text-indigo-600 dark:text-indigo-400' />
                            <div>
                                <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>7-Day Detailed Forecast</h2>
                                <p className='text-sm text-gray-600 dark:text-gray-400'>{location?.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Temperature Trend */}
                    <div className='mb-6'>
                        <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2'>
                            <TbTemperature size={24} className='text-red-500' />
                            Temperature Trend (7 Days)
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={weeklyChartData}>
                                <defs>
                                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                <XAxis 
                                    dataKey="day" 
                                    stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                                    label={{ value: 'Day of Week', position: 'insideBottom', offset: -5 }}
                                />
                                <YAxis 
                                    stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                                    label={{ value: `Temperature (°${unit})`, angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="max" 
                                    fill="url(#tempGradient)" 
                                    stroke="#ef4444" 
                                    strokeWidth={2}
                                    name={`Max Temp (°${unit})`}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="min" 
                                    fill="url(#tempGradient)" 
                                    stroke="#3b82f6" 
                                    strokeWidth={2}
                                    name={`Min Temp (°${unit})`}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="avg" 
                                    stroke="#f59e0b" 
                                    strokeWidth={3}
                                    dot={{ fill: '#f59e0b', r: 5 }}
                                    name={`Avg Temp (°${unit})`}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Precipitation & Humidity */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2'>
                                <BsCloudRainHeavy size={24} className='text-blue-500' />
                                Precipitation Probability
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={weeklyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                    <XAxis dataKey="day" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                    <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="precipitation" fill="#3b82f6" name="Precipitation (%)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div>
                            <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2'>
                                <WiHumidity size={28} className='text-cyan-500' />
                                Humidity Levels
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={weeklyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                    <XAxis dataKey="day" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                    <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="humidity" 
                                        stroke="#06b6d4" 
                                        strokeWidth={3}
                                        dot={{ fill: '#06b6d4', r: 5 }}
                                        name="Humidity (%)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Daily Details Accordion */}
                <div className='glass dark:glass-dark rounded-3xl p-6'>
                    <h3 className='text-xl font-bold text-gray-800 dark:text-white mb-4'>
                        Daily Breakdown
                    </h3>
                    <Collapse 
                        accordion 
                        className='forecast-collapse'
                        onChange={(key) => setSelectedDay(key ? dailyData.find(d => d.date === key) : null)}
                    >
                        {dailyData.map((day) => (
                            <Panel
                                header={
                                    <div className='flex items-center justify-between w-full pr-4'>
                                        <div className='flex items-center gap-4'>
                                            <img 
                                                src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                                                alt="weather"
                                                className='w-12 h-12'
                                            />
                                            <div>
                                                <div className='font-bold text-lg text-gray-800 dark:text-white'>
                                                    {day.dayName}
                                                </div>
                                                <div className='text-sm text-gray-600 dark:text-gray-400'>
                                                    {day.dateFormatted}
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-6'>
                                            <div className='text-center'>
                                                <div className='text-xs text-gray-500 dark:text-gray-400'>High</div>
                                                <div className='text-xl font-bold text-red-500'>{day.maxTemp}°{unit}</div>
                                            </div>
                                            <div className='text-center'>
                                                <div className='text-xs text-gray-500 dark:text-gray-400'>Low</div>
                                                <div className='text-xl font-bold text-blue-500'>{day.minTemp}°{unit}</div>
                                            </div>
                                            <div className='text-center'>
                                                <BsDropletFill className='text-blue-400 mx-auto mb-1' size={16} />
                                                <div className='text-sm font-semibold'>{day.avgPop}%</div>
                                            </div>
                                        </div>
                                    </div>
                                }
                                key={day.date}
                            >
                                <div className='space-y-4 pt-4'>
                                    {/* Quick Stats */}
                                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                        <div className='bg-white dark:bg-gray-700 rounded-lg p-3 text-center'>
                                            <WiThermometer size={32} className='mx-auto text-orange-500' />
                                            <div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>Avg Temp</div>
                                            <div className='text-lg font-bold text-gray-800 dark:text-white'>{day.avgTemp}°{unit}</div>
                                        </div>
                                        <div className='bg-white dark:bg-gray-700 rounded-lg p-3 text-center'>
                                            <WiHumidity size={32} className='mx-auto text-cyan-500' />
                                            <div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>Humidity</div>
                                            <div className='text-lg font-bold text-gray-800 dark:text-white'>{day.avgHumidity}%</div>
                                        </div>
                                        <div className='bg-white dark:bg-gray-700 rounded-lg p-3 text-center'>
                                            <WiStrongWind size={32} className='mx-auto text-teal-500' />
                                            <div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>Wind</div>
                                            <div className='text-lg font-bold text-gray-800 dark:text-white'>{day.avgWind} m/s</div>
                                        </div>
                                        <div className='bg-white dark:bg-gray-700 rounded-lg p-3 text-center'>
                                            <WiBarometer size={32} className='mx-auto text-purple-500' />
                                            <div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>Pressure</div>
                                            <div className='text-lg font-bold text-gray-800 dark:text-white'>{day.avgPressure} hPa</div>
                                        </div>
                                    </div>

                                    {/* Hourly Breakdown */}
                                    <div>
                                        <h4 className='font-semibold text-gray-800 dark:text-white mb-3'>Hourly Forecast</h4>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <ComposedChart data={getHourlyData(day)}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                                <XAxis 
                                                    dataKey="time" 
                                                    stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                />
                                                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Bar dataKey="precipitation" fill="#3b82f6" name="Rain (%)" opacity={0.6} />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="temp" 
                                                    stroke="#ef4444" 
                                                    strokeWidth={2}
                                                    dot={{ r: 3 }}
                                                    name={`Temp (°${unit})`}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Hourly Cards */}
                                    <div className='overflow-x-auto'>
                                        <div className='flex gap-3 pb-2'>
                                            {getHourlyData(day).map((hour, idx) => (
                                                <div 
                                                    key={idx}
                                                    className='min-w-[120px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-3 text-white shadow-md'
                                                >
                                                    <div className='text-center font-semibold text-sm mb-2'>
                                                        {hour.timeFormatted}
                                                    </div>
                                                    <img 
                                                        src={`https://openweathermap.org/img/wn/${hour.icon}@2x.png`}
                                                        alt="weather"
                                                        className='w-12 h-12 mx-auto'
                                                    />
                                                    <div className='text-center'>
                                                        <div className='text-2xl font-bold'>{hour.temp}°{unit}</div>
                                                        <div className='text-xs opacity-90 mt-1'>
                                                            <WiRaindrop className='inline' /> {hour.precipitation}%
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        ))}
                    </Collapse>
                </div>
            </div>
        </div>
    );
};

export default DetailedForecast;
