import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import api from '../services/api'
import { setUser } from '../redux/feature/userSlice'
import { setCart } from '../redux/feature/cartSlice'
import { toast } from 'react-toastify'

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formValidation = () => {
    const emailRegex = /^[a-zA-Z0-9!#$%&*]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[!@#$%&*])(?=.*[A-Z0-9])[a-zA-Z0-9!@#$%&*]{8,}$/;
    if (!email) {
      toast.error('Email required!');
    } else if (!emailRegex.test(email)) {
      toast.error('Email invalid!');
    } else if (!password) {
      toast.error('Password required!');
    } else if (!passwordRegex.test(password)) {
      toast.error('Password invalid!');
    } else {
      return true;
    }
    return false;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formValidation()) {
      try {
        const response = await api.post('/users/login', { email, password });
        if (response.data.status === 'Login success!') {
          toast.success('Login success!');
          dispatch(setUser(response.data.user));
          dispatch(setCart(response.data.user.cart || []));
          navigate('/');
        } else {
          toast.error(response.data.status || 'Login failed!');
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Error connecting to server!');
      }
    }
  }

  return (
    <div className='h-screen w-full bg-gradient-to-r from-white to-[#87a8f4] flex justify-center py-20 px-5'>
      <form onSubmit={handleSubmit} className='h-[180px] w-[260px] sm:w-[532px] bg-[#87a8f4] rounded-md shadow-st flex justify-between'>

        <div id="form-left" className='flex flex-wrap h-[180px] w-52 m-5 gap-y-1.5'>
          <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none' />
          <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none' />
          <button type='submit' className='h-6 w-20 mt-1 text-white bg-[#5a86ec] rounded text-xs hover:bg-white hover:text-[#87a8f4] hover:shadow-stw transition-all duration-300 ease-in'>
            Login
          </button>
        </div>

        <div id="form-right" className='h-[180px] w-48 py-14 px-5 bg-[#5a86ec] rounded-r-md rounded-l-3xl text-white'>
          <h2 className='text-lg font-bold'>Hello, Welcome</h2>
          <p className='text-[10px]'>Didn't have an account,</p>
          <Link to='/register'>
            <p className='text-[10px] underline'>Register now!</p>
          </Link>
        </div>
      </form>

    </div>
  )
}
