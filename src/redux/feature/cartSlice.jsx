import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { toast } from "react-toastify";

const initialState = {
    cart : []
}

// Thunk to add/increment an item in the cart
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async (item, { getState, dispatch }) => {
        const state = getState();
        const user = state.user.user;
        const productId = item.id || item._id;
        const existingItem = state.cart.cart.find(i => (i.id || i._id) === productId);

        // local optimistic state update
        dispatch(cartSlice.actions._addToCart(item));

        if (user) {
            const userId = user._id;
            try {
                if (existingItem) {
                    await api.patch(`/users/cart/${userId}/${productId}`, {
                        title: item.title,
                        qnty: existingItem.qnty + 1
                    });
                } else {
                    await api.patch(`/users/cart/${userId}`, {
                        _id: productId,
                        title: item.title,
                        description: item.description || '',
                        category: item.category || '',
                        image: item.image || '',
                        price: item.price,
                        owner: item.owner || userId,
                        qnty: 1
                    });
                }
            } catch (err) {
                console.error("Failed to sync addToCart with server:", err);
            }
        }
    }
);

// Thunk to decrement an item quantity or remove if it hits 0
export const removeSingleItem = createAsyncThunk(
    'cart/removeSingleItem',
    async (item, { getState, dispatch }) => {
        const state = getState();
        const user = state.user.user;
        const productId = item.id || item._id;
        const existingItem = state.cart.cart.find(i => (i.id || i._id) === productId);

        dispatch(cartSlice.actions._removeSingleItem(item));

        if (user && existingItem) {
            const userId = user._id;
            try {
                if (existingItem.qnty > 1) {
                    await api.patch(`/users/cart/${userId}/${productId}`, {
                        title: item.title,
                        qnty: existingItem.qnty - 1
                    });
                } else {
                    await api.delete(`/users/cart/${userId}/${productId}`, {
                        data: { title: item.title }
                    });
                }
            } catch (err) {
                console.error("Failed to sync removeSingleItem with server:", err);
            }
        }
    }
);

// Thunk to remove an item entirely from cart
export const removeItem = createAsyncThunk(
    'cart/removeItem',
    async (item, { getState, dispatch }) => {
        const state = getState();
        const user = state.user.user;
        const productId = item.id || item._id;

        dispatch(cartSlice.actions._removeItem(item));

        if (user) {
            const userId = user._id;
            try {
                await api.delete(`/users/cart/${userId}/${productId}`, {
                    data: { title: item.title }
                });
            } catch (err) {
                console.error("Failed to sync removeItem with server:", err);
            }
        }
    }
);

// Thunk to empty the entire cart
export const emptyCart = createAsyncThunk(
    'cart/emptyCart',
    async (_, { getState, dispatch }) => {
        const state = getState();
        const user = state.user.user;

        dispatch(cartSlice.actions._emptyCart());

        if (user) {
            const userId = user._id;
            try {
                await api.delete(`/users/cart/${userId}`);
            } catch (err) {
                console.error("Failed to sync emptyCart with server:", err);
            }
        }
    }
);

const cartSlice = createSlice({
    name : 'cartSlice',
    initialState,
    reducers : {
        // Reducer to replace client cart with DB cart, mapping keys
        setCart : (state, action) => {
            state.cart = action.payload.map(item => ({
                ...item,
                id: item.id || item._id
            }));
        },

        _addToCart : (state,action)=>{
            let itemIndex = state.cart.findIndex(item=> (item.id || item._id) === (action.payload.id || action.payload._id));
            if(itemIndex>=0){
                state.cart[itemIndex].qnty += 1;
                toast(`${action.payload.title.substr(0,18)}... - one more added!`);
            }else{
                let item = {...action.payload, qnty : 1};
                state.cart.push(item);
                toast(`${action.payload.title.substr(0,18)}... added to cart!`);
            }
        },

        _removeSingleItem : (state,action)=>{
            let itemIndex = state.cart.findIndex(item=> (item.id || item._id) === (action.payload.id || action.payload._id));
            if (itemIndex >= 0) {
                if(state.cart[itemIndex].qnty>1){
                    state.cart[itemIndex].qnty -= 1;
                }else{
                    const newArr = state.cart.filter(item=> (item.id || item._id) !== (action.payload.id || action.payload._id));
                    state.cart = newArr;
                }
            }
        },

        _removeItem : (state,action)=>{
            const newArr = state.cart.filter(item=> (item.id || item._id) !== (action.payload.id || action.payload._id));
            state.cart = newArr; 
        },

        _emptyCart : (state,action)=>{
            state.cart = [];
        }

    }
});

export const { setCart } = cartSlice.actions;
export default cartSlice.reducer;