import React from 'react'
import { useNavigate } from 'react-router-dom'
import StarRating from './StarRating.jsx'

export default function BookCard({ book }) {
  const navigate = useNavigate()

  const formatPrice = (p) =>
    p === 0 ? 'FREE' : `Rp ${p?.toLocaleString('id-ID')}`

  return (
    <div
      onClick={() => navigate(`/book/${book._id}`)}
      className="group flex flex-col h-full cursor-pointer"
    >
      {/* Visual Container */}
      <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden bg-neutral-100 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-black/10 group-hover:-translate-y-2">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          onError={e => { e.target.src = 'https://via.placeholder.com/400x600?text=No+Cover' }}
        />
        
        {/* Subtle Gradient Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {book.shelf === 'hot' && (
            <span className="bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-xl animate-pulse">HOT</span>
          )}
          {book.accessType === 'sale' && (
            <span className="bg-black text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-xl">SALE</span>
          )}
        </div>

        {/* Hover Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/5 backdrop-blur-[2px]">
            <div className="bg-white text-black p-4 rounded-full shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="mt-5 flex flex-col flex-1 gap-1">
        <div className="flex justify-between items-center mb-1">
          <p className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em] truncate max-w-[70%]">{book.author}</p>
          <div className="scale-75 origin-right">
            <StarRating score={book.averageRating || book.weightedRating || 0} showCount={false} />
          </div>
        </div>
        
        <h3 className="text-sm font-black text-black leading-tight uppercase tracking-tighter line-clamp-2 min-h-[2.5rem]">
          {book.title}
        </h3>

        <div className="mt-auto pt-3 flex justify-between items-center">
            <div className="flex flex-col">
                <p className="text-[10px] font-black text-black tracking-tighter">
                    {book.accessType === 'free' ? 'FREE ACCESS' : formatPrice(book.price)}
                </p>
                {book.accessType === 'sale' && <p className="text-[7px] font-bold text-black/20 uppercase tracking-widest">ONE-TIME PURCHASE</p>}
            </div>
            <div className="w-7 h-7 rounded-full border border-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                <span className="text-xs font-black">&rarr;</span>
            </div>
        </div>
      </div>
    </div>
  )
}
