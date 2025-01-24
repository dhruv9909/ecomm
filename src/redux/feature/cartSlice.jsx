import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
    cart : []
}

const cartSlice = createSlice({
    name : 'cartSlice',
    initialState,
    reducers : {

        addToCart : (state,action)=>{
            let itemIndex = state.cart.findIndex(item=>item.id === action.payload.id);
            if(itemIndex>=0){
                state.cart[itemIndex].qnty += 1;
                toast(`${action.payload.title.substr(0,18)}... - one more added!`);
            }else{
                let item = {...action.payload, qnty : 1};
                state.cart.push(item);
                toast(`${action.payload.title.substr(0,18)}... added to cart!`);
            }
        },

        removeSingleItem : (state,action)=>{
            let itemIndex = state.cart.findIndex(item=>item.id === action.payload.id);
            if(state.cart[itemIndex].qnty>1){
                state.cart[itemIndex].qnty -= 1;
            }else{
                const newArr = state.cart.filter(item=>item.id !== action.payload.id);
                state.cart = newArr;
            }
        },

        removeItem : (state,action)=>{
            const newArr = state.cart.filter(item=> item.id !== action.payload.id);
            state.cart = newArr; 
        },

        emptyCart : (state,action)=>{
            state.cart = [];
        }

    }
});

export const { addToCart, emptyCart, removeItem, removeSingleItem } =  cartSlice.actions;
export default cartSlice.reducer;