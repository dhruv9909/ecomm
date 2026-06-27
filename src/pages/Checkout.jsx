import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { emptyCart } from '../redux/feature/cartSlice';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.cart);
  const currentUser = useSelector((state) => state.user.user);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    paymentMethod: 'cod',
  });

  // Pre-fill user data if logged in
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.number || '',
      }));
    }
  }, [currentUser]);

  // Order summary calculation
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQnty, setTotalQnty] = useState(0);

  useEffect(() => {
    let price = 0;
    let qty = 0;
    cartItems.forEach((item) => {
      price += item.qnty * item.price;
      qty += item.qnty;
    });
    setTotalPrice(Math.round(price));
    setTotalQnty(qty);
  }, [cartItems]);

  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [searchParams] = useSearchParams();
  const paymentSuccess = searchParams.get('success') === 'true';
  const paymentCancel = searchParams.get('cancel') === 'true';

  const hasProcessedRef = useRef(false);

  // Handle Stripe Redirection Query Params on mount/update
  useEffect(() => {
    if (hasProcessedRef.current) return;

    const processPaymentSuccess = async () => {
      hasProcessedRef.current = true;
      const savedFormData = localStorage.getItem('ecomm_checkout_form');
      const savedCart = localStorage.getItem('ecomm_checkout_cart');
      const savedTotal = localStorage.getItem('ecomm_checkout_total');

      let parsedForm = formData;
      let parsedCart = cartItems;
      let parsedTotal = totalPrice;

      if (savedFormData) {
        try {
          parsedForm = JSON.parse(savedFormData);
          setFormData(parsedForm);
        } catch (e) {
          console.error('Error parsing saved checkout form:', e);
        }
      }

      if (savedCart) {
        try {
          parsedCart = JSON.parse(savedCart);
        } catch (e) {
          console.error('Error parsing saved checkout cart:', e);
        }
      }

      if (savedTotal) {
        parsedTotal = Number(savedTotal) || totalPrice;
      }

      const randomOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      setOrderId(randomOrderId);

      try {
        // Create the order on the backend database
        await api.post('/orders', {
          orderId: randomOrderId,
          items: parsedCart,
          totalAmount: parsedTotal,
          shippingAddress: {
            name: parsedForm.name,
            phone: parsedForm.phone,
            address: parsedForm.address,
            city: parsedForm.city,
            state: parsedForm.state,
            zip: parsedForm.zip,
            country: parsedForm.country
          },
          paymentMethod: 'card',
          paymentStatus: 'Completed'
        });

        setIsOrdered(true);
        // Clear cart in Redux state (cart deletion on server is handled inside POST /orders endpoint)
        dispatch(emptyCart());
        toast.success('Payment completed & order placed successfully!');
      } catch (err) {
        console.error('Failed to save order to database:', err);
        toast.error('Payment succeeded, but we failed to record your order. Please contact support.');
      } finally {
        // Clear local storage checkout caches
        localStorage.removeItem('ecomm_checkout_form');
        localStorage.removeItem('ecomm_checkout_cart');
        localStorage.removeItem('ecomm_checkout_total');
        // Clear query parameters from address bar to prevent back button triggers
        navigate('/checkout', { replace: true });
      }
    };

    if (paymentSuccess) {
      processPaymentSuccess();
    } else if (paymentCancel) {
      hasProcessedRef.current = true;
      const savedFormData = localStorage.getItem('ecomm_checkout_form');
      if (savedFormData) {
        try {
          const parsed = JSON.parse(savedFormData);
          setFormData(parsed);
        } catch (e) {
          console.error('Error parsing saved checkout form:', e);
        }
      }
      toast.warn('Payment was cancelled. You can try again or select Cash on Delivery.');
      
      // Clean up
      localStorage.removeItem('ecomm_checkout_form');
      localStorage.removeItem('ecomm_checkout_cart');
      localStorage.removeItem('ecomm_checkout_total');
      navigate('/checkout', { replace: true });
    }
  }, [paymentSuccess, paymentCancel, dispatch, navigate, cartItems, totalPrice, formData]);

  useEffect(() => {
    // Only redirect to home if they are not in the success state
    if (cartItems.length === 0 && !isOrdered && !paymentSuccess) {
      toast.info('Your cart is empty. Redirecting to home...');
      navigate('/');
    }
  }, [cartItems, isOrdered, paymentSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation check
    const { name, email, phone, address, city, state, zip, country, paymentMethod } = formData;
    if (!name || !email || !phone || !address || !city || !state || !zip || !country) {
      toast.error('Please fill in all the required fields!');
      return;
    }

    if (paymentMethod === 'card') {
      try {
        // Save checkout details to local storage before redirecting to Stripe
        localStorage.setItem('ecomm_checkout_form', JSON.stringify(formData));
        localStorage.setItem('ecomm_checkout_cart', JSON.stringify(cartItems));
        localStorage.setItem('ecomm_checkout_total', totalPrice.toString());

        // Create Stripe checkout session
        const response = await api.post('/checkout/create-checkout-session', {
          cartItems,
        });

        if (response.data && response.data.url) {
          window.location.href = response.data.url;
        } else {
          toast.error('Failed to create payment session. Please try again.');
        }
      } catch (err) {
        console.error('Stripe checkout error:', err);
        const errMsg = err.response?.data?.error || 'Payment service is temporarily unavailable.';
        toast.error(errMsg);
      }
    } else {
      const randomOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      
      try {
        // Post COD order to backend
        await api.post('/orders', {
          orderId: randomOrderId,
          items: cartItems,
          totalAmount: totalPrice,
          shippingAddress: {
            name,
            phone,
            address,
            city,
            state,
            zip,
            country
          },
          paymentMethod: 'cod',
          paymentStatus: 'Pending'
        });

        setOrderId(randomOrderId);
        setIsOrdered(true);
        dispatch(emptyCart());
        toast.success('Order placed successfully!');
      } catch (err) {
        console.error('Failed to place COD order:', err);
        const errMsg = err.response?.data?.error || 'Failed to place order. Please try again.';
        toast.error(errMsg);
      }
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen h-full w-full bg-gradient-to-r from-white to-[#87a8f4] px-6 py-16 flex justify-center items-center">
        <div className="bg-white rounded-2xl p-10 max-w-lg w-full shadow-2xl text-center border-t-8 border-[#5a86ec]">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 text-4xl animate-bounce">
            ✓
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-lg text-[#5a86ec] font-semibold mb-4">Your order has been placed successfully.</p>
          
          <div className="bg-gray-50 rounded-lg p-5 mb-6 border border-gray-100 text-left">
            <p className="text-sm text-gray-600 mb-2">
              <strong className="text-gray-800">Order ID:</strong> {orderId}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong className="text-gray-800">Deliver To:</strong> {formData.name}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong className="text-gray-800">Address:</strong> {formData.address}, {formData.city}, {formData.state} - {formData.zip}
            </p>
            <p className="text-sm text-gray-600">
              <strong className="text-gray-800">Payment Mode:</strong> {formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-8">A confirmation email and SMS with delivery updates will be sent shortly.</p>
          
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-6 text-white font-bold bg-[#5a86ec] hover:bg-[#4771d4] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full w-full bg-gradient-to-r from-white to-[#87a8f4] px-4 md:px-20 lg:px-40 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#5a86ec] mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-st border border-gray-100">
              
              {/* User details */}
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a86ec] focus:border-[#5a86ec] outline-none transition-all text-sm text-gray-800"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a86ec] focus:border-[#5a86ec] outline-none transition-all text-sm text-gray-800"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a86ec] focus:border-[#5a86ec] outline-none transition-all text-sm text-gray-800"
                    placeholder="Enter your contact number"
                  />
                </div>
              </div>

              {/* Delivery details */}
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a86ec] focus:border-[#5a86ec] outline-none transition-all text-sm text-gray-800"
                    placeholder="Flat / House no. / Street name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a86ec] focus:border-[#5a86ec] outline-none transition-all text-sm text-gray-800"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State / Province *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a86ec] focus:border-[#5a86ec] outline-none transition-all text-sm text-gray-800"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code *</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a86ec] focus:border-[#5a86ec] outline-none transition-all text-sm text-gray-800"
                    placeholder="ZIP Code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a86ec] focus:border-[#5a86ec] outline-none transition-all text-sm text-gray-800"
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Payment details */}
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-[#5a86ec] bg-[#ecf2fe]' : 'border-gray-300 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#5a86ec] focus:ring-[#5a86ec]"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-bold text-gray-800">Cash On Delivery</span>
                    <span className="block text-xs text-gray-500">Pay cash at the time of delivery</span>
                  </div>
                </label>
                
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-[#5a86ec] bg-[#ecf2fe]' : 'border-gray-300 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#5a86ec] focus:ring-[#5a86ec]"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-bold text-gray-800">Credit / Debit Card</span>
                    <span className="block text-xs text-gray-500">All major cards supported</span>
                  </div>
                </label>
              </div>

              <div className="mt-8 flex justify-between gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="py-3 px-6 text-sm font-semibold text-[#5a86ec] bg-[#ecf2fe] hover:bg-[#dee8fe] rounded-xl transition-all"
                >
                  Return to Cart
                </button>
                <button
                  type="submit"
                  className="py-3 px-8 text-sm font-bold text-white bg-[#5a86ec] hover:bg-[#4771d4] rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Place Order (${totalPrice})
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#5a86ec] text-white rounded-2xl p-6 shadow-st sticky top-6">
              <h2 className="text-xl font-bold mb-6 pb-2 border-b border-[#87a8f4]">Order Summary</h2>
              
              <div className="max-h-72 overflow-y-auto pr-1 mb-6 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id || item._id} className="flex justify-between items-start py-3 border-b border-[#87a8f4]/40 text-xs">
                    <div className="max-w-[70%]">
                      <p className="font-bold truncate">{item.title}</p>
                      <p className="text-[#dee8fe] mt-0.5">Qty: {item.qnty}</p>
                    </div>
                    <p className="font-semibold">${Math.round(item.price * item.qnty)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#dee8fe]">
                  <span>Subtotal</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="flex justify-between text-[#dee8fe]">
                  <span>Shipping</span>
                  <span className="font-bold text-green-300">Free</span>
                </div>
                <div className="flex justify-between text-[#dee8fe]">
                  <span>Total Items</span>
                  <span>{totalQnty}</span>
                </div>
                <div className="border-t border-[#87a8f4] pt-3 flex justify-between font-extrabold text-base">
                  <span>Grand Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
