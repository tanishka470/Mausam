
export const geocode = async (text) => {
    const URL = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&limit=15&apiKey=${import.meta.env.VITE_GEOCODING_API_KEY}`;
    try {
        const res = await fetch(URL);
        const data = await res.json();

        const arr = []
        data.features.map(obj=>{
            const suburb = obj?.properties?.suburb;
            const city = obj?.properties?.city;
            const state = obj?.properties?.state;
            const country = obj?.properties?.country;

            let curr = `${suburb ? `${suburb}, ` : ''}${city ? `${city}, ` : ''}${state}, ${country}`;
            let objData = {
                label: curr,
                value: {
                    address: curr,
                    lat: obj?.properties?.lat,
                    lon: obj?.properties?.lon,
                }
            }
            arr.push(objData);
        })
        return arr;
    } catch (error) {
        console.log('Error!');
    }
    return [];

}

export const reverseGeocode = async (lat,lon) => {
    const URL = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${import.meta.env.VITE_GEOCODING_API_KEY}`;
    try {
        const res = await fetch(URL);
        const data = await res.json();
        if(data?.features?.length>0){
            const suburb = data?.features[0]?.properties?.suburb;
            const city = data?.features[0]?.properties?.city;
            const state = data?.features[0]?.properties?.state;
            const country = data?.features[0]?.properties?.country;

            let curr = `${suburb ? `${suburb}, ` : ''}${city ? `${city}, ` : ''}${state}, ${country}`;
            return {
                address: curr,
                lat: data?.features[0]?.properties?.lat,
                lon: data?.features[0]?.properties?.lon,
            }
        }else{
            return null;
        }
    } catch (error) {
        console.log('Error!');
        return null;
    }
}

// const getPlaces2 = async (text)=>{
//     const URL = `https://api.openweathermap.org/geo/1.0/direct?q=${text}&limit=7&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
//     try {
//         const res = await fetch(URL);
//         const data = await res.json();

//         const arr = []
//         data.map(info=>{
//             let curr = info.name + ", " + info.state + ", " + info.country
//             let objData = {
//                 address:curr,
//                 lat:info.lat,
//                 lon:info.lon,
//             }
//             arr.push(objData);
//         })
//         return arr;
//     } catch (error) {
//         console.log(error);
//     }
//     return [];
// }