import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { clearUser } from '../redux/feature/userSlice';
import { emptyCart } from '../redux/feature/cartSlice';
import { toast } from 'react-toastify';

export default function Navbar({ openSearch, setCatValue }) {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // select user from Redux state
  const user = useSelector((state) => state.user.user);

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

  const handleLogout = async () => {
    try {
      const response = await api.get('/users/logout');
      if (response.data.status === 'Logged out!') {
        toast.success('Logged out successfully!');
        dispatch(clearUser());
        dispatch(emptyCart());
        navigate('/');
      } else {
        toast.error(response.data.status || 'Logout failed!');
      }
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Error logging out!');
    }
  };

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

      <div className='flex items-center gap-4'>
        <Link className='m-2 flex' to='/cart'>
          <i className="fa-solid fa-cart-shopping text-lg transition-all hover:scale-125"></i><sup className='h-3 w-3 m-1 text-[#5a86ec] bg-white rounded-lg flex items-center justify-center'>{totalQnty}</sup>
        </Link>
        
        {user ? (
          <div className='flex items-center gap-3'>
            <span className='text-xs font-semibold bg-[#87a8f4] px-2 py-0.5 rounded'>Hi, {user.name}</span>
            <button 
              onClick={handleLogout} 
              className='text-xs bg-white text-[#5a86ec] px-2.5 py-0.5 rounded hover:bg-white/80 hover:scale-105 active:scale-95 transition-all font-semibold'
            >
              Logout
            </button>
          </div>
        ) : (
          <Link className='m-2' to='/login'>Login/Signup</Link>
        )}
      </div>

    </div>
  )
}

"men's clothing"
"jewelery"
"electronics"
"women's clothing"