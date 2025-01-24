import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../redux/feature/cartSlice';

export default function Search({ search, data, openModal }) {

  const [searches, setSearches] = useState([]);
  const navigate = useNavigate();
  const searchArr = search.split(' ');
  // console.log(searchArr);

  useEffect(() => {
    if (search) {
      const newSearch = [];
      searchArr.map(any => {
        // console.log(any);
        // console.log(data.filter(item => item.title.toLowerCase().includes(any)));
        const temp = data.filter(item => item.title.toLowerCase().includes(any));
        const tem = data.filter(item => item.category.toLowerCase().includes(any));
        newSearch.push(...temp, ...tem);
      })
      
      // console.log('newSearch', newSearch);
      const unique = new Set(newSearch);
      setSearches([...unique]);
      // console.log(searches);
    } else {
      navigate('/');
    }
  }, [search])

  // useEffect(() => {
  //   if (search) {
  //     const newSearch = data.filter(item => {
  //       return item.title.toLowerCase().includes();
  //     });
  //     setSearches(newSearch);
  //   } else {
  //     navigate('/');
  //   }
  // }, [search])

  return (
    <div className='py-5 flex flex-wrap w-full max-w-full overflow-x-hidden bg-white min-h-[500px]'>
      {
        searches.map(item => {
          const { id, title, description, price, image, rating } = item;
          return (

            <div key={id} className='z-10 w-36 h-56 mx-14 my-6 bg-white text-[10px] rounded shadow-lg px-2 transition-all hover:scale-110 hover:cursor-pointer'>
              <div onClick={() => openModal(id, title, price, image, description, rating)} className='flex justify-center'>
                <img className='h-32' src={image} />
              </div>
              <div className='flex justify-center'>
                <p className='h-4 mt-1 truncate'>
                  {title}
                </p>
              </div>
              <p className='flex justify-center'>
                ${Math.round(price)}
              </p>
              <p className='flex gap-1 items-center'>
                {rating.rate} <i className="fa-solid fa-star text-yellow-400"></i>
              </p>
              <div className='flex justify-center w-full my-2 h-5 w-28'>
                <button onClick={() => { dispatch(addToCart(item)) }} className='h-5 w-full text-white bg-[#87a8f4] border-[#87a8f4] rounded-md hover:bg-white hover:text-[#87a8f4] hover:border-2'>
                  Add to Cart
                </button>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}
