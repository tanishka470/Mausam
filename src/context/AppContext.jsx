import {createContext,useState} from 'react'

const prevLocation = JSON.parse(localStorage.getItem('location'))

const AppContext = createContext({
    unit: '',
    setUnit: ()=>{},
    location: {},
    setLocation: ()=>{},
    theme: '',
    setTheme: ()=>{},
})

export const AppContextProvider = ({children})=>{
    const [unit,setUnit] = useState('C');
    const [location,setLocation] = useState(prevLocation ? 
        prevLocation : {address:"New Delhi, Delhi, IN", lat:28.6138954, lon:77.2090057})
    const [theme,setTheme] = useState('dark');

    return (
        <AppContext.Provider value={{
            unit,
            setUnit,
            location,
            setLocation,
            theme,
            setTheme,
        }}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContext;