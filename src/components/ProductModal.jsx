import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/feature/cartSlice';

export default function ProductModal({ onClose, modal }) {

  const dispatch = useDispatch();

  const modalRef = useRef();

  const fullStar = <i className="fa-solid fa-star text-yellow-400" />;
  const halfStar = <i className="fa-solid fa-star-half-stroke text-yellow-400"></i>;
  const user = <i className="fa-solid fa-user" style={{ color: "#74C0FC" }}></i>;

  const starRating = (n) => {
    const stars = [];
    for (let i = 1; i <= n; i++) {
      stars.push(fullStar);
    }
    if (Number.isInteger(n)) {
      return stars;
    } else {
      stars.push(halfStar);
      return stars;
    }
  }

  const closeModal = (e) => {
    if (modalRef.current === e.target) {
      onClose();
    }
  }

  const { id, title, price, description, image, rating } = modal;

  return (
    <div ref={modalRef} onClick={closeModal} className='z-20 fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center py-5'>
      <div className='bg-white w-1/2 rounded-xl p-3 text-xs flex flex-col min-h-[400px] max-h-[450px]'>
        <button onClick={onClose} className='place-self-end transition-all hover:scale-110'>
          <i className="fa-regular fa-circle-xmark text-xl"></i>
        </button>
        <div key={id}>
          <h1 className='text-md text-[#87a8f4] font-bold underline mb-5'>
            {title}
          </h1>
          <img className='h-24 my-5' src={image} />
          <p className='text-[10px] my-2'>{description}</p>
          <p className='my-2 text-lg font-bold' >
            ${Math.round(price)}
          </p>
          <button onClick={() => dispatch(addToCart(modal))} className='h-5 w-1/3 my-3 text-white bg-[#87a8f4] border-[#87a8f4] rounded-md hover:bg-white hover:text-[#87a8f4] hover:border-2'>
            Add to Cart
          </button>

          <div className='flex gap-7 items-center my-2'>
            <div className='flex'>{rating.rate} {
              starRating(rating.rate).map((star, index) => (
                <p key={index}>{star}</p>
              ))
            }
            </div>

            <p>{user}{rating.count}</p>

          </div>
        </div>
      </div>
    </div>
  )
}