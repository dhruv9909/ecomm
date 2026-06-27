import { useState, useEffect } from 'react';
import './App.css';
import Register from './pages/Register';
import Login from './pages/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Footer from './components/Footer';
import Category from './pages/Category';
import { useFetchProductsQuery } from './redux/feature/apiSlice';
import ProductModal from './components/ProductModal';
import SellerDashboard from './pages/SellerDashboard';
import Search from './pages/Search';
import { useDispatch, useSelector } from 'react-redux';
import api from './services/api';
import { setUser, clearUser } from './redux/feature/userSlice';
import { setCart } from './redux/feature/cartSlice';


function App() {

  const dispatch = useDispatch();
  const authChecked = useSelector((state) => state.user.authChecked);

  // Check auth session status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/users/auth');
        if (response.data && response.data.user) {
          dispatch(setUser(response.data.user));
          dispatch(setCart(response.data.user.cart || []));
        } else {
          dispatch(clearUser());
        }
      } catch (err) {
        console.error('Session check failed:', err);
        dispatch(clearUser());
      }
    };
    checkAuth();
  }, [dispatch]);

  // data fetching
  const { data, error, isFetching } = useFetchProductsQuery();

// modal functions
  const [showModal, setShowModal] = useState(false);

  const [modal, setModal] = useState({
    id: '',
    title: '',
    price: '',
    description: '',
    image: ''
  })

  const openModal = (id, title, price, image, description, rating) => {
    setModal({
      id: id,
      title: title,
      description: description,
      price: price,
      image: image,
      rating : rating
    })
    setShowModal(true);
  }

//search functions
  const [search, setSearch] = useState('');

  const openSearch = (any) =>{
    setSearch(any);
  }

// category value to maintain category
  const [catValue, setCatValue] = useState('');

  if (!authChecked) {
    return (
      <div className='py-5 flex justify-center items-center w-full max-w-full bg-white h-screen'>
        <div className='h-16 w-16 border-8 border-[#5a86ec] rounded-[50%] border-t-white animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='h-full max-w-full box-border bg-gradient-to-r from-white to-[#5a86ec]'>
      {showModal && <div className='transition-all duration-1000'>
        <ProductModal modal={modal} onClose={() => setShowModal(false)} />
      </div>
      }
      <BrowserRouter>
        <Navbar setCatValue={setCatValue} openSearch={openSearch} />
        <Routes>
          <Route exact path='/' element={<Home data={data} error={error} isFetching={isFetching} modal={modal} openModal={openModal} catValue={catValue} />} />
          <Route exact path='/login' element={<Login />} />
          <Route exact path='/register' element={<Register />} />
          <Route exact path='/cart' element={<Cart />} />
          <Route exact path='/checkout' element={<Checkout />} />
          <Route exact path='/orders' element={<Orders />} />
          <Route exact path='/seller-dashboard' element={<SellerDashboard />} />
          <Route exact path='/category' element={<Category data={data} isFetching={isFetching} openModal={openModal} />} />
          <Route exact path='/search' element={<Search data={data} search={search} openModal={openModal} />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  )
}

export default App
