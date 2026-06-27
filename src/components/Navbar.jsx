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

  const [showPopover, setShowPopover] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
    <div className='h-10 max-w-full text-white text-sm bg-[#5a86ec] px-5 flex justify-between items-center relative'>

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

      <div className='flex items-center gap-4 z-50'>
        <Link className='m-2 flex' to='/cart'>
          <i className="fa-solid fa-cart-shopping text-lg transition-all hover:scale-125"></i><sup className='h-3 w-3 m-1 text-[#5a86ec] bg-white rounded-lg flex items-center justify-center'>{totalQnty}</sup>
        </Link>
        
        {user ? (
          <div className='relative flex items-center'>
            <i 
              className="fa-solid fa-circle-user text-xl cursor-pointer hover:scale-110 active:scale-95 transition-all text-white"
              onClick={() => setShowPopover(!showPopover)}
            ></i>
            
            {showPopover && (
              <>
                {/* Click outside target to close */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent cursor-default" 
                  onClick={() => setShowPopover(false)}
                ></div>
                
                {/* Shadcn-like Popover */}
                <div className="absolute right-0 top-7 w-44 bg-white border border-slate-200 rounded-md shadow-lg py-1.5 z-50 text-slate-800 transition-all animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Account</span>
                    <div className="font-semibold text-slate-800 text-xs truncate mt-0.5">{user.name}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowPopover(false);
                      setShowConfirmDialog(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-red-600 font-bold hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                  >
                    <i className="fa-solid fa-right-from-bracket text-[10px]"></i>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link className='m-2' to='/login'>Login/Signup</Link>
        )}
      </div>

      {/* Shadcn-like AlertDialog for Logout Confirmation */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-200">
          <div className="w-[90%] max-w-sm bg-white border border-slate-200 rounded-lg shadow-xl p-5 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-semibold text-slate-900">Are you sure you want to log out?</h3>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              This will end your current session. You will need to sign in again to access your personal cart and account settings.
            </p>
            <div className="flex justify-end gap-2.5 mt-5">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  handleLogout();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700 active:scale-95 transition-all"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

"men's clothing"
"jewelery"
"electronics"
"women's clothing"