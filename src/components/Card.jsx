import {useContext} from 'react'
import AppContext from '../context/AppContext'

const Card = ({children}) => {
    const {theme} = useContext(AppContext)
    return (
        <div className={`${theme==='dark' ? 'dark' : ''}`}>
            <div className='rounded-2xl min-h-96 w-full shadow-lg dark:shadow-2xl p-4 xl:p-8 bg-white dark:bg-gradient-to-b dark:from-gray-700 dark:to-gray-800'>
                {children}
            </div>
        </div>
    )
}

export default Card