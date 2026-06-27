import { configureStore } from "@reduxjs/toolkit";
import apiSlice from '../feature/apiSlice';
import cartReducer from '../feature/cartSlice';
import userReducer from '../feature/userSlice';

const store = configureStore({
    reducer : {
        [apiSlice.reducerPath] : apiSlice.reducer,
        cart : cartReducer,
        user : userReducer,
    },
    middleware : (getDefaultMiddleware)=>(
        getDefaultMiddleware().concat(apiSlice.middleware)
    )
});

export default store;