import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function Orders() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.user);
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if user is not logged in
    if (!currentUser) {
      toast.error('You need to log in to view your orders!');
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/orders/my-orders');
        if (response.data && response.data.orders) {
          setOrders(response.data.orders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Could not retrieve your orders. Please try again later.');
        toast.error('Failed to load orders.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, navigate]);

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="py-5 flex justify-center items-center w-full max-w-full bg-white h-screen">
        <div className="h-16 w-16 border-8 border-[#5a86ec] rounded-[50%] border-t-white animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen h-full w-full bg-gradient-to-r from-white to-[#87a8f4] px-4 md:px-20 lg:px-40 py-12 flex flex-col justify-center items-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center border-t-8 border-red-500">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Orders</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 text-white font-bold bg-[#5a86ec] hover:bg-[#4771d4] rounded-lg shadow transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full w-full bg-gradient-to-r from-white to-[#87a8f4] px-4 md:px-20 lg:px-40 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#5a86ec]">My Orders</h1>
          <button
            onClick={() => navigate('/')}
            className="py-2 px-4 text-xs font-bold text-white bg-[#5a86ec] hover:bg-[#4771d4] rounded-lg shadow transition-all"
          >
            Back to Shopping
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-st text-center border border-gray-100">
            <div className="w-20 h-20 bg-blue-50 text-[#5a86ec] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              📦
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
              You haven't placed any orders yet. Add some items to your cart and place an order!
            </p>
            <button
              onClick={() => navigate('/')}
              className="py-3 px-8 text-sm font-bold text-white bg-[#5a86ec] hover:bg-[#4771d4] rounded-xl shadow-lg transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 text-xs">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow">
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">Order Placed</span>
                      <span className="text-gray-700 font-medium block mt-0.5">{formatDate(order.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">Total Amount</span>
                      <span className="text-gray-800 font-bold block mt-0.5">${order.totalAmount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">Payment Method</span>
                      <span className="text-gray-700 font-medium block mt-0.5 uppercase">
                        {order.paymentMethod === 'card' ? 'Online Card' : 'Cash on Delivery'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">Status</span>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold mt-1 text-[10px] ${
                          order.paymentStatus === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-right font-semibold uppercase tracking-wider text-[10px]">Order ID</span>
                    <span className="text-gray-800 font-mono font-semibold block text-right mt-0.5">{order.orderId}</span>
                  </div>
                </div>

                {/* Order Products List */}
                <div className="p-6 divide-y divide-gray-100">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center justify-between">
                      <div className="flex gap-4 items-center">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 object-contain rounded border border-gray-100 p-1 flex-shrink-0"
                          />
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-800 max-w-sm md:max-w-md truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Qty: {item.qnty} × ${Math.round(item.price)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-800">
                        ${Math.round(item.price * item.qnty)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Delivery Information */}
                <div className="bg-slate-50/50 px-6 py-4 border-t border-gray-100 text-xs text-gray-600">
                  <span className="font-semibold text-gray-700">Delivery Address: </span>
                  {order.shippingAddress.name} ({order.shippingAddress.phone}) |{' '}
                  {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.zip}, {order.shippingAddress.country}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
