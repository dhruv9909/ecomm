import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { addToCart } from '../redux/feature/cartSlice';
import { useDispatch } from 'react-redux';

export default function Category({ data, openModal }) {

    const [catg, setCatg] = useState('');

    const location = useLocation();

    const dispatch = useDispatch();
    const select = location.state?.select;

    useEffect(() => {
        setCatg(select);
    }, [select]);

    const products = data.filter(item => item.category === catg);
    // console.log(products);
    return (
        <div className='py-5 flex flex-wrap w-full max-w-full overflow-x-hidden bg-white min-h-[500px]'>
            {
                products.map(item => {
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