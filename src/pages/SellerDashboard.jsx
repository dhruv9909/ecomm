import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const CATEGORIES = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing"
];

export default function SellerDashboard() {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  // Redirect if not logged in or not a seller
  useEffect(() => {
    if (!user) {
      navigate('/login');
      toast.error('Please login first!');
    } else if (user.type !== 'seller') {
      navigate('/');
      toast.error('Access denied. Seller account required.');
    }
  }, [user, navigate]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: CATEGORIES[0],
  });
  const [imageFile, setImageFile] = useState(null);

  // Fetch seller's products
  const fetchProducts = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const response = await api.get(`/products/${user._id}`);
      if (response.data && response.data.products) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch received orders
  const fetchOrders = async () => {
    if (!user?._id) return;
    try {
      setOrdersLoading(true);
      const response = await api.get('/orders/seller-orders');
      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load received orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchProducts();
      fetchOrders();
    }
  }, [user]);

  // Statistics
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  // Seller-specific order stats
  const totalRevenue = orders.reduce((sum, order) => {
    const sellerItems = order.items.filter(item => item.owner && item.owner.toString() === user._id.toString());
    const deliveredRevenue = sellerItems
      .filter(item => item.deliveryStatus === 'Delivered')
      .reduce((s, item) => s + (item.price * item.qnty), 0);
    return sum + deliveredRevenue;
  }, 0);

  const pendingDeliveriesCount = orders.reduce((count, order) => {
    const sellerItems = order.items.filter(item => item.owner && item.owner.toString() === user._id.toString());
    const pendingItemsCount = sellerItems.filter(item => ['Pending', 'Shipped'].includes(item.deliveryStatus)).length;
    return count + pendingItemsCount;
  }, 0);

  // Update item delivery status
  const handleUpdateStatus = async (orderId, itemId, newStatus) => {
    try {
      const response = await api.patch(`/orders/${orderId}/item/${itemId}/status`, {
        deliveryStatus: newStatus
      });
      if (response.status === 200) {
        toast.success(`Status updated to ${newStatus}`);
        fetchOrders();
      } else {
        toast.error('Failed to update delivery status');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error updating status');
    }
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Open modals helper
  const openAddModal = () => {
    setFormData({
      title: '',
      price: '',
      description: '',
      category: CATEGORIES[0],
    });
    setImageFile(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  // Handle Add Product Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.description || !formData.category) {
      toast.error('All text fields are required!');
      return;
    }
    if (!imageFile) {
      toast.error('Product image is required!');
      return;
    }

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('price', formData.price);
    payload.append('description', formData.description);
    payload.append('category', formData.category);
    payload.append('owner', user._id);
    payload.append('image', imageFile);

    try {
      const response = await api.post('/products', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'Product added!') {
        toast.success('Product added successfully!');
        setIsAddModalOpen(false);
        fetchProducts();
      } else {
        toast.error(response.data.status || 'Failed to add product');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error uploading product');
    }
  };

  // Handle Edit Product Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.description || !formData.category) {
      toast.error('All fields are required!');
      return;
    }

    try {
      const response = await api.patch(`/products/${selectedProduct._id}`, {
        title: formData.title,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category,
      });

      if (response.data.status === 'Product updated!') {
        toast.success('Product updated successfully!');
        setIsEditModalOpen(false);
        fetchProducts();
      } else {
        toast.error(response.data.status || 'Failed to update product');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating product');
    }
  };

  // Handle Delete Product
  const handleDeleteConfirm = async () => {
    try {
      const response = await api.delete(`/products/${selectedProduct._id}`);
      if (response.data.status === 'Product deleted!') {
        toast.success('Product deleted successfully!');
        setIsDeleteOpen(false);
        fetchProducts();
      } else {
        toast.error(response.data.status || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting product');
    }
  };

  // Render product image source helper
  const getProductImageSrc = (imgName) => {
    if (!imgName) return 'https://placehold.co/300x300?text=No+Image';
    if (imgName.startsWith('http')) return imgName;
    return `http://localhost:5000/images/${imgName}`;
  };

  if (!user || user.type !== 'seller') {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 py-10 px-4 sm:px-8">
      {/* Top Banner / Hero */}
      <div className="max-w-6xl mx-auto mb-8 bg-gradient-to-r from-[#5a86ec] to-[#87a8f4] text-white rounded-xl shadow-md p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-store text-xl"></i>
            Seller Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-100 mt-1">
            Welcome back, <span className="font-semibold underline">{user.name}</span>. Manage your shop inventory and listings here.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-white text-[#5a86ec] font-bold px-4 py-2 rounded-lg shadow hover:bg-slate-100 hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-2 text-xs sm:text-sm self-stretch sm:self-auto justify-center"
        >
          <i className="fa-solid fa-plus"></i>
          Add New Product
        </button>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-50 text-[#5a86ec] rounded-lg flex items-center justify-center text-xl">
            <i className="fa-solid fa-boxes-stacked"></i>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Products Listed</span>
            <span className="text-2xl font-bold text-slate-800">{totalProducts}</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-xl">
            <i className="fa-solid fa-indian-rupee-sign"></i>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Inventory Value</span>
            <span className="text-2xl font-bold text-slate-800">${totalValue.toFixed(2)}</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xl">
            <i className="fa-solid fa-indian-rupee-sign"></i>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Sales Revenue</span>
            <span className="text-2xl font-bold text-slate-800">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl ${pendingDeliveriesCount > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
            <i className="fa-solid fa-truck-fast"></i>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Deliveries</span>
            <span className="text-2xl font-bold text-slate-800">{pendingDeliveriesCount}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-6 border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-bold transition-all duration-200 border-b-2 px-1 flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-[#5a86ec] text-[#5a86ec]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <i className="fa-solid fa-boxes-stacked text-xs"></i>
          Products Inventory
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold transition-all duration-200 border-b-2 px-1 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-[#5a86ec] text-[#5a86ec]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <i className="fa-solid fa-truck-ramp-box text-xs"></i>
          Orders Received
          {pendingDeliveriesCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
              {pendingDeliveriesCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'products' ? (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-list text-sm text-[#5a86ec]"></i>
              Your Product Listings
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-12 w-12 border-4 border-[#5a86ec] rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center shadow-sm">
                <div className="text-slate-300 text-5xl mb-4">
                  <i className="fa-solid fa-box-open"></i>
                </div>
                <h3 className="text-base font-bold text-slate-700">No products uploaded yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Get started by uploading your first product. It will be immediately available in the catalog.
                </p>
                <button
                  onClick={openAddModal}
                  className="mt-4 bg-[#5a86ec] text-white text-xs font-bold py-2 px-4 rounded hover:bg-blue-600 transition"
                >
                  Add Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                  >
                    {/* Product Image Wrapper */}
                    <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center p-4">
                      <img
                        src={getProductImageSrc(product.image)}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/300x300?text=No+Image';
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-[#5a86ec] uppercase tracking-wider shadow-sm">
                        {product.category}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-[#5a86ec] transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900">${Number(product.price).toFixed(2)}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(product)}
                            className="h-7 w-7 text-slate-600 border border-slate-200 rounded hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition flex items-center justify-center text-xs"
                            title="Edit Product"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="h-7 w-7 text-slate-600 border border-slate-200 rounded hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition flex items-center justify-center text-xs"
                            title="Delete Product"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-truck-ramp-box text-sm text-[#5a86ec]"></i>
              Orders Received
            </h2>

            {ordersLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-12 w-12 border-4 border-[#5a86ec] rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center shadow-sm">
                <div className="text-slate-300 text-5xl mb-4">
                  <i className="fa-solid fa-boxes-packing"></i>
                </div>
                <h3 className="text-base font-bold text-slate-700">No orders received yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  When customers purchase your listed items, their orders will appear here for you to fulfill and deliver.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  // Filter out only the items that belong to the current seller
                  const sellerItems = order.items.filter(
                    item => item.owner && item.owner.toString() === user._id.toString()
                  );
                  
                  if (sellerItems.length === 0) return null;

                  const orderSubtotal = sellerItems.reduce((s, item) => s + (item.price * item.qnty), 0);

                  return (
                    <div
                      key={order._id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300"
                    >
                      {/* Order Header */}
                      <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 text-[11px]">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow text-slate-600">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Order Placed</span>
                            <span className="font-semibold block mt-0.5 text-slate-700">{formatDate(order.createdAt)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Your Revenue Share</span>
                            <span className="font-bold text-green-600 block mt-0.5">${orderSubtotal.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Payment Method</span>
                            <span className="font-semibold block mt-0.5 uppercase text-slate-700">
                              {order.paymentMethod === 'card' ? 'Online Card' : 'Cash on Delivery'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Payment Status</span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-bold mt-1 text-[9px] ${
                                order.paymentStatus === 'Completed'
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Order ID</span>
                          <span className="font-mono font-bold block mt-0.5 text-slate-800">{order.orderId}</span>
                        </div>
                      </div>

                      {/* Items belonging to this Seller */}
                      <div className="p-5 divide-y divide-slate-100">
                        {sellerItems.map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row gap-4 py-4 first:pt-0 last:pb-0 justify-between items-start sm:items-center">
                            <div className="flex gap-4 items-center">
                              <img
                                src={getProductImageSrc(item.image)}
                                alt={item.title}
                                className="w-12 h-12 object-contain rounded border border-slate-200 p-1 flex-shrink-0 bg-white"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/300x300?text=No+Image';
                                }}
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 line-clamp-1 max-w-md">
                                  {item.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  Qty: <span className="font-semibold text-slate-700">{item.qnty}</span> × ${Number(item.price).toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:items-end gap-3 self-stretch sm:self-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <span className="text-xs font-bold text-slate-800 self-center sm:self-auto">
                                Subtotal: ${(item.price * item.qnty).toFixed(2)}
                              </span>
                              
                              {/* Custom Colored Status Dropdown Select */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delivery:</span>
                                <select
                                  value={item.deliveryStatus || 'Pending'}
                                  onChange={(e) => handleUpdateStatus(order.orderId, item._id, e.target.value)}
                                  className={`text-xs font-bold py-1 px-2.5 rounded-lg border outline-none transition-all cursor-pointer ${
                                    item.deliveryStatus === 'Delivered'
                                      ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-100'
                                      : item.deliveryStatus === 'Shipped'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-100'
                                      : item.deliveryStatus === 'Cancelled'
                                      ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-100'
                                      : 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-100'
                                  }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address */}
                      <div className="bg-slate-50/50 px-5 py-3 border-t border-slate-100 text-[10px] text-slate-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                          <span className="font-bold text-slate-700">Ship To: </span>
                          <span className="font-medium text-slate-800">{order.shippingAddress.name}</span>
                          <span className="text-slate-400 mx-1.5">|</span>
                          <span className="font-bold text-slate-700">Phone: </span>
                          <span className="font-medium text-slate-800">{order.shippingAddress.phone}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Address: </span>
                          <span className="font-medium text-slate-800">
                            {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}, {order.shippingAddress.country}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-[#5a86ec] text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa-solid fa-plus-circle"></i> Add New Product
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white transition"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                  className="w-full border border-slate-200 rounded p-2 text-slate-800 outline-none focus:border-[#5a86ec]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="99.99"
                    step="0.01"
                    min="0"
                    className="w-full border border-slate-200 rounded p-2 text-slate-800 outline-none focus:border-[#5a86ec]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded p-2 text-slate-800 outline-none focus:border-[#5a86ec]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe details, specifications, condition, etc..."
                  rows="3"
                  className="w-full border border-slate-200 rounded p-2 text-slate-800 outline-none focus:border-[#5a86ec] resize-none"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Product Image
                </label>
                <div className="mt-1 flex items-center justify-center border border-dashed border-slate-200 rounded p-4 bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="text-center">
                    <i className="fa-solid fa-cloud-arrow-up text-lg text-slate-400 mb-1"></i>
                    <p className="text-[10px] text-slate-500">
                      {imageFile ? imageFile.name : "Drag & drop or click to upload"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-2 font-bold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-2 font-bold text-white bg-[#5a86ec] rounded hover:bg-blue-600"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleEditSubmit}
            className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-[#5a86ec] text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa-solid fa-pen-to-square"></i> Edit Product Details
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-white/80 hover:text-white transition"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded p-2 text-slate-800 outline-none focus:border-[#5a86ec]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full border border-slate-200 rounded p-2 text-slate-800 outline-none focus:border-[#5a86ec]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded p-2 text-slate-800 outline-none focus:border-[#5a86ec]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full border border-slate-200 rounded p-2 text-slate-800 outline-none focus:border-[#5a86ec] resize-none"
                  required
                ></textarea>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-3.5 py-2 font-bold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-2 font-bold text-white bg-[#5a86ec] rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg shadow-xl p-5 text-slate-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-semibold text-slate-900">Are you sure you want to delete this product?</h3>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              This action cannot be undone. Product <span className="font-semibold text-slate-800">"{selectedProduct?.title}"</span> will be permanently deleted from the store.
            </p>
            <div className="flex justify-end gap-2.5 mt-5 text-xs">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-3.5 py-1.5 font-bold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3.5 py-1.5 font-bold text-white bg-red-600 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
