import React, { useEffect, useState } from 'react';
import { addToCart } from '../redux/feature/cartSlice'
import { useDispatch } from 'react-redux';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import Slider from '../components/Slider';

// import ProductModal from '../components/ProductModal';

export default function Home({ data, error, isFetching, openModal, catValue }) {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentPage, setCurrentpage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(8);

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;

// delayed loading & run loader if not loading
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  // console.log('before 1.5s', result);
  useEffect(()=>{
    setTimeout(()=>{
      setIsLoading(isFetching);
      setResult(data);
      // console.log('after1.5s', result);
  },1500);
  },[])

  // let currentPosts;
  //state made to re-render component while using setTimeout for loader
  // const [currentPosts, setCurrentPosts] = useState([]);
let currentPosts;
// if (data){currentPosts = data.slice(firstPostIndex,lastPostIndex);}
  // useEffect(()=>{
  //   // setTimeout(() => {
  //   //   setCurrentPosts(data.slice(firstPostIndex, lastPostIndex));
  //   //   console.log(currentPosts);
      
  //   // }, 2000);
  //   const post = data.slice(firstPostIndex, lastPostIndex);
  //   setCurrentPosts(post);
  // },[data])

// to maintain category state while navigating to home page
  let select = catValue;

  useEffect(() => {
    if (select) {
      navigate('/category', { state: { select } });
    }
  }, [])

  // const [showModal, setShowModal] = useState(false);

  // const [modal, setModal] = useState({
  //   id : '',
  //   title : '',
  //   price : '',
  //   description : '',
  //   image : ''
  // })

  // const openModal = (id, title, price, image, description) =>{
  //   setModal({
  //     id : id,
  //     title : title,
  //     description : description,
  //     price : price,
  //     image : image,
  //   })
  //   setShowModal(true);
  // }

  if (!isLoading && !result){
    return (
      <div className='py-5 flex justify-center items-center w-full max-w-full bg-white min-h-[500px]'>

    <div className='h-16 w-16 border-8 border-[#5a86ec] rounded-[50%] border-t-white animate-spin'>
      
    </div>
    </div>
    )
  } else if (error) {
    console.log(error.message);
  } else {
    currentPosts = data.slice(firstPostIndex, lastPostIndex);

    return (
      <div className='bg-gray-100'>
        {/* {showModal && <div className='transition-all duration-1000'>
         <ProductModal modal={modal} onClose={()=>setShowModal(false)}/>
        </div>
        } */}
        <Slider />
        <div className='mt-4 py-5 flex flex-wrap justify-around w-full max-w-full overflow-x-hidden bg-white rounded-t-3xl min-h-[500px]'>
          {
            currentPosts && currentPosts.map(item => {
              const { id, title, price, image, description, rating } = item;

              return (
                <div key={id} className='z-10 w-36 h-56 mx-14 my-6 text-[10px] rounded shadow-lg px-2 transition-all hover:scale-110 hover:cursor-pointer'>
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
                  <div className='flex justify-center w-full my-3 h-5 w-28'>
                    <button onClick={() => dispatch(addToCart(item))} className='h-5 w-full text-white bg-[#87a8f4] border-[#87a8f4] rounded-md hover:bg-white hover:text-[#87a8f4] hover:border-2'>
                      Add to Cart
                    </button>
                  </div>
                </div>
              )

            })
          }
        </div>


        <div className='flex justify-center pb-5 bg-white'>
          <Pagination totalPosts={data.length} postsPerPage={postsPerPage} setCurrentPage={setCurrentpage} currentPage={currentPage} />
        </div>
      </div>
    )
  }
}