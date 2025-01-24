import React, { useEffect, useState } from 'react'
import new2 from '../assets/new2.jpg'
import new1 from '../assets/new1.jpg'
import new5 from '../assets/new5.jpg'
import new4 from '../assets/new4.jpg'
import new6 from '../assets/new6.jpg'

export default function Slider() {

    const imgArr = [new1, new2, new5, new6, new4];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            currentIndex >= 4 ? setCurrentIndex(0) : setCurrentIndex(currentIndex + 1);
        }, 3000);

        return () => clearInterval(interval);
    }, [currentIndex])

    const handlePrevious = () =>{
        currentIndex <= 0 ? setCurrentIndex(4) : setCurrentIndex(currentIndex - 1);
    }

    const handleNext = () =>{
        currentIndex >= 4 ? setCurrentIndex(0) : setCurrentIndex(currentIndex + 1);
    }

    return (
        <div style={{backgroundImage: `url(${imgArr[currentIndex]})`}} className='text-[#5a86ec] h-80 w-full bg-cover rounded-b-3xl flex justify-between items-center'>
            <button onClick={handlePrevious} className='h-8 w-8 m-2 bg-white rounded-[50%] flex justify-center items-center transition-all hover:scale-110'>
                <i className="fa-solid fa-backward"></i>
            </button>
            <button onClick={handleNext} className='h-8 w-8 m-2 bg-white rounded-[50%] flex justify-center items-center transition-all hover:scale-110'>
                <i className="fa-solid fa-forward"></i>
            </button>
        </div>
    )
}