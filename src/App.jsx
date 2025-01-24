import { useState } from 'react';
import './App.css';
import Register from './pages/Register';
import Login from './pages/Login';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Footer from './components/Footer';
import Category from './pages/Category';
import { useFetchProductsQuery } from './redux/feature/apiSlice';
import ProductModal from './components/ProductModal';
import Search from './pages/Search';


function App() {

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
          <Route exact path='/category' element={<Category data={data} isFetching={isFetching} openModal={openModal} />} />
          <Route exact path='/search' element={<Search data={data} search={search} openModal={openModal} />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  )
}

export default App
