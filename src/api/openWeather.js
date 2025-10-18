const baseURL = 'https://api.openweathermap.org/data/2.5/'

const getWeather = async (location,unit) => {
    const unitVal = (unit==='C' ? "metric" : "imperial")
    const URL = `${baseURL}weather?lat=${location.lat}&lon=${location.lon}&units=${unitVal}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`

    try {
        const data = await fetch(URL);
        const res = await data.json();
        return res;
    } catch (error) {
        console.log(error);
    }
    return {};
}

const getForecast = async (location,unit) => {
    const unitVal = (unit==='C' ? "metric" : "imperial")
    const URL = `${baseURL}forecast/?lat=${location.lat}&lon=${location.lon}&units=${unitVal}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`

    try {
        const data = await fetch(URL);
        const res = await data.json();
        return res;
    } catch (error) {
        console.log(error);
    }
    return {};
}

export {getWeather,getForecast};