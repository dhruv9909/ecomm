// import { createSlice } from "@reduxjs/toolkit";
// import { useState } from "react"

// const [currentPage, setCurrentPage] = useState(0);
// const [postsPerPage, setPostsPerPage] = useState(0);

// const initialState = {
//     lastPostIndex : 0,
//     firstPostIndex : 0
// }

// const pagesSlice = createSlice({
//     name : 'pagesSlice',
//     initialState,
//     reducers : {

//         pageSelect : (state,action)=>{
//             setCurrentPage(action.payload);
//             state.lastPostIndex = currentPage * postsPerPage;
//             state.firstPostIndex = state.lastPostIndex - postsPerPage;
//         }

//     }
// })

// export const { pageSelect } = pagesSlice.actions;
// export default pagesSlice.reducer;