import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Navbar({ openSearch, setCatValue }) {

  const navigate = useNavigate();

  //select
  const [select, setSelect] = useState("");

  useEffect(() => {
    if (select) {
      navigate('/category', { state: { select } });
    } else {
      navigate("/");
    }
  }, [select])

  //category  
  const handleCategory = (e) => {
    setSelect(e.target.value);
    setCatValue(e.target.value);
  }

  // cart count
  const result = useSelector(state => state.cart.cart);

  const [totalQnty, setTotalQnty] = useState(0);
  useEffect(() => {
    let qnty = 0;
    result.forEach(item => {qnty += item.qnty});
    setTotalQnty(qnty);

  }, [result])

  return (
    <div className='h-10 max-w-full text-white text-sm bg-[#5a86ec] px-5 flex justify-between items-center'>

      <div className='flex gap-8 justify-between items-center'>
        <Link to='/'>Ecomm</Link>
        <div className='flex gap-2 items-center'>
          <input type='text' placeholder='Search Products' className='text-black text-xs p-1 rounded outline-none' onChange={(e) => openSearch(e.target.value)} />
          <i className="fa-solid fa-magnifying-glass transition-all hover:cursor-pointer hover:scale-125" onClick={() => navigate('/search')}></i>
        </div>
        <select name="category" onChange={(e) => handleCategory(e)} className='text-black text-[12px] p-1 bg-white hover:cursor-pointer rounded outline-none'>
          <option value="">All</option>
          <option value="men's clothing">Men's clothing</option>
          <option value="jewelery">Jewelery</option>
          <option value="electronics">Electronics</option>
          <option value="women's clothing">Women's clothing</option>
        </select>
      </div>

      <div className='flex items-center'>
        <Link className='m-2 flex' to='/cart'>
          <i className="fa-solid fa-cart-shopping text-lg transition-all hover:scale-125"></i><sup className='h-3 w-3 m-1 text-[#5a86ec] bg-white rounded-lg flex items-center justify-center'>{totalQnty}</sup>
        </Link>
        <Link className='m-2' to='/login'>Login/Signup</Link>
      </div>

    </div>
  )
}

"men's clothing"
"jewelery"
"electronics"
"women's clothing"