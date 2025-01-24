import { configureStore } from "@reduxjs/toolkit";
import apiSlice from '../feature/apiSlice';
import cartReducer from '../feature/cartSlice';

const store = configureStore({
    reducer : {
        [apiSlice.reducerPath] : apiSlice.reducer,
        cart : cartReducer,
    },
    middleware : (getDefaultMiddleware)=>(
        getDefaultMiddleware().concat(apiSlice.middleware)
    )
});

export default store;