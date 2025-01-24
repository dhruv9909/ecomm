import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiSlice = createApi({
    reducerPath : 'apiSlice',
    baseQuery : fetchBaseQuery({
        baseUrl : 'http://localhost:3000',
    }),
    endpoints : (builder)=>({
        fetchProducts : builder.query({
            query : ()=>('/products')
        })
    })
});

export const { useFetchProductsQuery } = apiSlice;
export default apiSlice;