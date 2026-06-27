import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { toast } from 'react-toastify'

export default function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    password: '',
    confPassword: '',
    type: 'buyer'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const formValidation = () => {
    const { name, email, number, password, confPassword } = formData;
    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[a-zA-Z0-9!#$%&*]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
    const numberRegex = /^[0-9]{10}$/;
    const passwordRegex = /^(?=.*[!@#$%&*])(?=.*[A-Z0-9])[a-zA-Z0-9!@#$%&*]{8,}$/;
    if (!name) {
      toast.error('Name required!');
    } else if (!nameRegex.test(name)) {
      toast.error('Name invalid (letters and spaces only)!');
    } else if (!email) {
      toast.error('Email required!');
    } else if (!emailRegex.test(email)) {
      toast.error('Email invalid!');
    } else if (!number) {
      toast.error('Phone Number required!');
    } else if (!numberRegex.test(number)) {
      toast.error('Phone number invalid (10 digits required)!');
    } else if (!password) {
      toast.error('Password required!');
    } else if (!passwordRegex.test(password)) {
      toast.error('Password invalid! Must be >=8 chars, containing uppercase/digit & special char.');
    } else if (!confPassword) {
      toast.error('Confirm Password required!');
    } else if (confPassword !== password) {
      toast.error('Passwords not matching!');
    } else {
      return true;
    }
    return false;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formValidation()) {
      try {
        const response = await api.post('/users/register', {
          name: formData.name,
          email: formData.email,
          number: formData.number,
          password: formData.password,
          type: formData.type
        });
        
        if (response.data.status === 'Registration success!') {
          toast.success('Registration success!');
          navigate('/login');
        } else {
          toast.error(response.data.status || 'Registration failed!');
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Error connecting to the server!');
      }
    }
  }

  return (
    <div className='h-screen w-full flex justify-center py-20 px-5 bg-gradient-to-r from-white to-[#87a8f4]'>
      <form onSubmit={handleSubmit} className='h-[310px] w-[260px] sm:w-[532px] bg-[#87a8f4] rounded-md shadow-st flex justify-between'>

        <div id="form-left" className='flex flex-wrap h-[280px] w-48 m-5 gap-y-1.5'>
          <input name='name' type='text' placeholder='Name' className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none' value={formData.name} onChange={(e) => handleChange(e)}/>
          <input name='email' type='email' placeholder='Email' className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none' value={formData.email} onChange={(e) => handleChange(e)} />
          <input name='number' type='number' placeholder='Phone Number' className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none' value={formData.number} onChange={(e) => handleChange(e)} />
          <input name='password' type='password' placeholder='Password' className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none' value={formData.password} onChange={(e) => handleChange(e)} />
          <input name='confPassword' type='password' placeholder='Confirm Password' className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none' value={formData.confPassword} onChange={(e) => handleChange(e)} />
          
          <select name='type' className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none hover:cursor-pointer' value={formData.type} onChange={(e) => handleChange(e)}>
            <option value='buyer'>Buyer Account</option>
            <option value='seller'>Seller Account</option>
          </select>

          <button type='submit' className='h-6 w-20 text-white bg-[#5a86ec] rounded mt-1 text-xs hover:bg-white hover:text-[#87a8f4] hover:shadow-stw transition-all duration-300 ease-in'>
            Register
          </button>
        </div>

        <div id="form-right" className='h-[310px] w-48 py-20 px-5 text-white bg-[#5a86ec] rounded-r-md rounded-l-3xl'>
          <h2 className='text-lg font-bold'>Hello, Welcome</h2>
          <p className='text-[10px]'>Already have an account,</p>
          <Link to='/login'>
            <p className='text-[10px] underline'>Login now!</p>
          </Link>
        </div>

      </form>
    </div>
  )
}