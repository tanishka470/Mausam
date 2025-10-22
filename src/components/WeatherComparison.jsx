import React, { useState, useContext, useEffect } from 'react';
import { getWeather } from '../api/openWeather';
import { geocode } from '../api/geoCoding';
import AppContext from '../context/AppContext';
import { Select, Spin, Button, message } from 'antd';
import { MdCompare, MdClose, MdAdd } from 'react-icons/md';
import { WiThermometer, WiHumidity, WiStrongWind } from 'react-icons/wi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import debounce from 'lodash/debounce';

const WeatherComparison = ({ theme }) => {
    const { unit } = useContext(AppContext);
    const [compareLocations, setCompareLocations] = useState([]);
    const [weatherDataList, setWeatherDataList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchOptions, setSearchOptions] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const searchWithDebounce = debounce(async (text) => {
        if (text?.length > 3) {
            setSearchLoading(true);
            const res = await geocode(text);
            setSearchOptions(res || []);
            setSearchLoading(false);
        } else {
            setSearchOptions([]);
        }
    }, 700);

    const addLocationToCompare = async (locationString) => {
        try {
            const location = JSON.parse(locationString);
            
            // Check if already added
            if (compareLocations.find(loc => loc.lat === location.lat && loc.lon === location.lon)) {
                message.warning('This location is already in comparison');
                return;
            }

            // Max 4 locations
            if (compareLocations.length >= 4) {
                message.warning('Maximum 4 locations can be compared');
                return;
            }

            setCompareLocations([...compareLocations, location]);
            setSearchOptions([]);
        } catch (error) {
            console.error('Error adding location:', error);
        }
    };

    const removeLocation = (index) => {
        const newLocations = compareLocations.filter((_, i) => i !== index);
        setCompareLocations(newLocations);
    };

    const fetchAllWeatherData = async () => {
        if (compareLocations.length < 2) {
            message.warning('Please add at least 2 locations to compare');
            return;
        }

        setLoading(true);
        try {
            const promises = compareLocations.map(loc => getWeather(loc, unit));
            const results = await Promise.all(promises);
            setWeatherDataList(results.filter(data => data !== null));
        } catch (error) {
            console.error('Error fetching weather data:', error);
            message.error('Failed to fetch weather data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (compareLocations.length >= 2) {
            fetchAllWeatherData();
        } else {
            setWeatherDataList([]);
        }
    }, [compareLocations, unit]);

    // Prepare chart data
    const temperatureData = weatherDataList.map((data, index) => ({
        name: compareLocations[index]?.address?.split(', ')[0] || `City ${index + 1}`,
        temp: data?.main?.temp || 0,
        feels_like: data?.main?.feels_like || 0,
        min: data?.main?.temp_min || 0,
        max: data?.main?.temp_max || 0,
    }));

    const humidityWindData = weatherDataList.map((data, index) => ({
        name: compareLocations[index]?.address?.split(', ')[0] || `City ${index + 1}`,
        humidity: data?.main?.humidity || 0,
        wind: data?.wind?.speed || 0,
        pressure: data?.main?.pressure || 0,
    }));

    const radarData = weatherDataList.map((data, index) => {
        const cityName = compareLocations[index]?.address?.split(', ')[0] || `City ${index + 1}`;
        return {
            subject: cityName,
            Temperature: data?.main?.temp || 0,
            Humidity: data?.main?.humidity || 0,
            Wind: (data?.wind?.speed || 0) * 10, // Scale up for visibility
            Pressure: (data?.main?.pressure || 0) / 10, // Scale down
            Clouds: data?.clouds?.all || 0,
        };
    });

    return (
        <div className={`${theme === 'dark' ? 'dark' : ''}`}>
            <div className='glass dark:glass-dark rounded-3xl p-6 animate-fade-in'>
                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-3'>
                        <MdCompare size={32} className='text-indigo-600 dark:text-indigo-400' />
                        <div>
                            <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>Weather Comparison</h2>
                            <p className='text-sm text-gray-600 dark:text-gray-400'>Compare weather across multiple cities</p>
                        </div>
                    </div>
                </div>

                {/* Search and Add Locations */}
                <div className='mb-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl'>
                    <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                        Add Cities to Compare ({compareLocations.length}/4)
                    </label>
                    <div className='flex gap-2'>
                        <Select
                            showSearch
                            placeholder="🔍 Search for a city..."
                            notFoundContent={searchLoading ? <Spin size="small" /> : null}
                            filterOption={false}
                            onSearch={searchWithDebounce}
                            onChange={addLocationToCompare}
                            value={null}
                            className='flex-1'
                            style={{ minHeight: '40px' }}
                            options={searchOptions.map((option) => ({
                                label: option.label,
                                value: JSON.stringify(option.value)
                            }))}
                        />
                    </div>
                </div>

                {/* Selected Locations */}
                {compareLocations.length > 0 && (
                    <div className='mb-6 flex flex-wrap gap-2'>
                        {compareLocations.map((location, index) => (
                            <div 
                                key={index}
                                className='flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 rounded-full text-white shadow-md'
                            >
                                <span className='font-medium'>{location.address.split(', ')[0]}</span>
                                <button 
                                    onClick={() => removeLocation(index)}
                                    className='hover:bg-red-500 rounded-full p-1 transition-colors'
                                >
                                    <MdClose size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className='flex justify-center items-center py-12'>
                        <Spin size='large' />
                    </div>
                )}

                {/* Comparison Results */}
                {!loading && weatherDataList.length >= 2 && (
                    <div className='space-y-6'>
                        {/* Weather Cards */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                            {weatherDataList.map((data, index) => (
                                <div 
                                    key={index}
                                    className='bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow'
                                >
                                    <h3 className='text-lg font-bold mb-2 truncate text-white'>
                                        {compareLocations[index]?.address?.split(', ')[0]}
                                    </h3>
                                    <div className='flex items-center justify-between mb-3'>
                                        <div className='text-4xl font-bold text-white'>{data?.main?.temp}°{unit}</div>
                                        {data?.weather?.[0]?.icon && (
                                            <img 
                                                src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                                                alt="weather"
                                                className='w-16 h-16 drop-shadow-lg'
                                            />
                                        )}
                                    </div>
                                    <div className='text-sm space-y-1 text-white/95'>
                                        <div className='flex justify-between'>
                                            <span>Feels like:</span>
                                            <span className='font-bold'>{data?.main?.feels_like}°{unit}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span>Humidity:</span>
                                            <span className='font-bold'>{data?.main?.humidity}%</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span>Wind:</span>
                                            <span className='font-bold'>{data?.wind?.speed} m/s</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Temperature Comparison Chart */}
                        <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg'>
                            <h3 className='text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2'>
                                <WiThermometer size={28} className='text-red-500' />
                                Temperature Comparison
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={temperatureData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                    <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                    <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="temp" fill="#ef4444" name={`Temperature (°${unit})`} radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="feels_like" fill="#f97316" name={`Feels Like (°${unit})`} radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Temperature Range Chart */}
                        <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg'>
                            <h3 className='text-xl font-bold text-gray-800 dark:text-white mb-4'>
                                Temperature Range (Min/Max)
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={temperatureData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                    <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                    <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={3} name={`Max Temp (°${unit})`} />
                                    <Line type="monotone" dataKey="min" stroke="#3b82f6" strokeWidth={3} name={`Min Temp (°${unit})`} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Humidity and Wind Comparison */}
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                            {/* Humidity Chart */}
                            <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg'>
                                <h3 className='text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2'>
                                    <WiHumidity size={28} className='text-blue-500' />
                                    Humidity Comparison
                                </h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={humidityWindData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                        <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                        <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Bar dataKey="humidity" fill="#3b82f6" name="Humidity (%)" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Wind Speed Chart */}
                            <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg'>
                                <h3 className='text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2'>
                                    <WiStrongWind size={28} className='text-teal-500' />
                                    Wind Speed Comparison
                                </h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={humidityWindData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                        <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                        <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Bar dataKey="wind" fill="#14b8a6" name="Wind Speed (m/s)" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Overall Radar Comparison */}
                        <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg'>
                            <h3 className='text-xl font-bold text-gray-800 dark:text-white mb-4'>
                                Overall Weather Conditions Radar
                            </h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <RadarChart data={[
                                    { 
                                        subject: 'Temperature', 
                                        ...Object.fromEntries(temperatureData.map((d, i) => [d.name, d.temp]))
                                    },
                                    { 
                                        subject: 'Humidity', 
                                        ...Object.fromEntries(humidityWindData.map((d, i) => [d.name, d.humidity]))
                                    },
                                    { 
                                        subject: 'Wind', 
                                        ...Object.fromEntries(humidityWindData.map((d, i) => [d.name, d.wind * 10]))
                                    },
                                ]}>
                                    <PolarGrid stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                    <PolarAngleAxis dataKey="subject" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                    <PolarRadiusAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                    {temperatureData.map((city, index) => (
                                        <Radar
                                            key={city.name}
                                            name={city.name}
                                            dataKey={city.name}
                                            stroke={['#ef4444', '#3b82f6', '#10b981', '#f59e0b'][index]}
                                            fill={['#ef4444', '#3b82f6', '#10b981', '#f59e0b'][index]}
                                            fillOpacity={0.3}
                                        />
                                    ))}
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && weatherDataList.length === 0 && compareLocations.length < 2 && (
                    <div className='text-center py-12'>
                        <MdCompare size={64} className='mx-auto text-gray-400 mb-4' />
                        <h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                            Start Comparing Cities
                        </h3>
                        <p className='text-gray-600 dark:text-gray-400'>
                            Add at least 2 cities to see weather comparison with interactive charts
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherComparison;
