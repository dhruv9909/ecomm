import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <div className='flex justify-between items-center h-52 w-full text-xs text-white text-center bg-[#5a86ec] rounded-t-3xl px-32 py-20'>

            <div className='underline'>
            <Link to='/'><p>Home</p></Link>
            <Link to='/cart'><p>Cart</p></Link>
            </div>

            <div className='text-2xl'>
                <p>Ecomm</p>
                <p className='text-xs'>
                    &copy;Copyright. All rights reserved.
                </p>
            </div>

            <div className='underline'>
            <Link to='/login'><p>Login</p></Link>
            <Link to='/register'><p>Register</p></Link>
            </div>

        </div>
    )
}