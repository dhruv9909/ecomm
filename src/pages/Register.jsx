import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Register() {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    password: '',
    confPassword: ''
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
      alert('Name required!');
    } else if (!nameRegex.test(name)) {
      alert('Name invalid!');
    } else if (!email) {
      alert('Email required!');
    } else if (!emailRegex.test(email)) {
      alert('Email invalid!');
    } else if (!number) {
      alert('Phone Number required!');
    } else if (!numberRegex.test(number)) {
      alert('Phone number invalid!');
    } else if (!password) {
      alert('Password required!');
    } else if (!passwordRegex.test(password)) {
      alert('Password invalid!');
    } else if (!confPassword) {
      alert('Confirm Password required!');
    } else if (confPassword !== password) {
      alert('Passwords not matching!');
    } else {
      return true;
    }
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (formValidation()) {
      console.log(formData);

   }
  }

  return (
    <div className='h-screen w-full flex justify-center py-20 px-5 bg-gradient-to-r from-white to-[#87a8f4]'>
      <form className='h-[270px] w-[260px] sm:w-[532px] bg-[#87a8f4] rounded-md shadow-st flex justify-between'>

        <div id="form-left" className='flex flex-wrap h-[270px] w-48 m-5'>
          <input name='name' type='text' placeholder='Name' className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none' value={formData.name} onChange={(e) => handleChange(e)}/>
          <input name='email' type='email' placeholder='Email' className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none' value={formData.email} onChange={(e) => handleChange(e)} />
          <input name='number' type='number' placeholder='Phone Number' className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none' value={formData.number} onChange={(e) => handleChange(e)} />
          <input name='password' type='password' placeholder='Password' className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none' value={formData.password} onChange={(e) => handleChange(e)} />
          <input name='confPassword' type='password' placeholder='Confirm Password' className='h-6 w-full rounded text-[10px] text-black p-1 focus:outline-none' value={formData.confPassword} onChange={(e) => handleChange(e)} />
          <button className='h-6 w-20 text-white bg-[#5a86ec] rounded my-3 text-xs hover:bg-white hover:text-[#87a8f4] hover:shadow-stw transition-all duration-300 ease-in' onClick={(e) => { handleSubmit(e) }}>
            Register
          </button>
        </div>

        <div id="form-right" className='h-[270px] w-48 py-16 px-5 text-white bg-[#5a86ec] rounded-r-md rounded-l-3xl'>
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