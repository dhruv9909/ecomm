import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, emptyCart, removeItem, removeSingleItem } from '../redux/feature/cartSlice'

export default function Cart() {

  const dispatch = useDispatch();

  const data = useSelector(state => state.cart.cart);

  const [totalPrice, setTotalPrice] = useState(0);

  const [totalQnty, setTotalQnty] = useState(0);

  const total_Qnty = () => {
    let qnty = 0;
    data.forEach(item => {
      qnty += item.qnty;
    })
    setTotalQnty(qnty);
  }

  const total_Price = () => {
    let price = 0;
    data.forEach(item => {
      price += item.qnty * item.price;
    });
    setTotalPrice(Math.round(price));
  }

  useEffect(() => {
    total_Qnty();
    total_Price();
  }, [data]);

  return (
    <div className='min-h-screen h-full w-full bg-gradient-to-r from-white to-[#87a8f4] px-40 py-12'>
      <div className='bg-[#5a86ec] text-white rounded-md p-5 shadow-st'>
        <div className='flex justify-between mb-5'>
          <p className='text-xl font-bold'>Cart</p>
          <button onClick={() => dispatch(emptyCart())} className='h-7 w-16 text-sm text-[#87a8f4] bg-white rounded transition-all hover:bg-[#87a8f4] hover:text-white'>
            <i className="fa-solid fa-trash mr-2" /> Cart
          </button>
        </div>
        <table className='w-full table-auto text-sm'>
          <thead>
            <tr className='bg-[#87a8f4] rounded'>
              <th className="pr-4 pl-1 py-2 text-left text-white">Products</th>
              <th className="pr-4 py-2 text-center text-white">Quantity</th>
              <th className="pr-4 py-2 text-center text-white">Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              data && data.map(item => (
                <tr key={item.id} className='text-xs border-b my-2'>
                  <td className='pr-4 py-2 pl-1 truncate max-w-44'>{item.title}</td>
                  <td className='pr-4 py-2 text-center text-[12px]'>
                    <button onClick={() => dispatch(removeSingleItem(item))} className='m-2 bg-white text-[16px] text-[#5a86ec] h-4 w-4 rounded'>-</button>
                    {item.qnty}
                    <button onClick={() => dispatch(addToCart(item))} className='m-2 bg-white text-[16px] text-[#5a86ec] h-4 w-4 rounded'>+</button>
                  </td>
                  <td className='pr-4 py-2 text-center'>${Math.round(item.price * item.qnty)}</td>
                  <td>
                    <button onClick={() => dispatch(removeItem(item))} className='h-7 w-24 text-sm'>
                      <i className="fa-solid fa-trash transition-all hover:scale-125 hover:cursor-pointer" style={{color: "#ffffff"}}></i>
                    </button>
                  </td>
                </tr>
              ))
            }
            <tr className='text-sm font-bold pl-1'>
              <td className='pl-1'>Total</td>
              <td className='pr-4 py-2 text-center'>{totalQnty}</td>
              <td className='pr-4 py-2 text-center'>${totalPrice}</td>
            </tr>
          </tbody>

        </table>

      </div>
    </div>
  )
}