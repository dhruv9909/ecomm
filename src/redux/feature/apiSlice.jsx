import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiSlice = createApi({
    reducerPath : 'apiSlice',
    baseQuery : fetchBaseQuery({
        baseUrl : 'http://localhost:5000',
    }),
    endpoints : (builder)=>({
        fetchProducts : builder.query({
            query : ()=>('/allproducts'),
            transformResponse: (response) => {
                const products = Array.isArray(response) ? response : (response?.products || response?.product || []);
                return products.map(item => ({
                    ...item,
                    id: item._id,
                    image: item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:5000/images/${item.image}`) : 'https://placehold.co/300x300?text=No+Image',
                    rating: (item.rating && typeof item.rating === 'object' && 'rate' in item.rating) ? item.rating : { rate: 4.5, count: 120 }
                }));
            }
        })
    })
});

export const { useFetchProductsQuery } = apiSlice;
export default apiSlice;