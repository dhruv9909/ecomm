import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiSlice = createApi({
    reducerPath : 'apiSlice',
    baseQuery : fetchBaseQuery({
        baseUrl : 'https://fakestoreapi.com',
    }),
    endpoints : (builder)=>({
        fetchProducts : builder.query({
            query : ()=>('/products')
        })
    })
});

export const { useFetchProductsQuery } = apiSlice;
export default apiSlice;