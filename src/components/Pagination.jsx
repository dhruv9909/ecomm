import React from 'react'

export default function pagination({ totalPosts, postsPerPage, setCurrentPage, currentPage }) {

  let pages = [];

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pages.push(i);
  }

  return (
    <div className='m-2 flex gap-2'>
      {
        pages.map((page, index) => {
          return (
            <div key={index} className='text-white'>
              <button onClick={() => setCurrentPage(page)} className={page === currentPage ? 'bg-[#336df5] h-6 w-6 rounded hover:scale-125 transition-all duration-300' : 'bg-[#87a8f4] h-6 w-6 rounded hover:scale-125 transition-all duration-300'} >
                {page}
              </button>
            </div>
          )
        })
      }
    </div>
  )
}
