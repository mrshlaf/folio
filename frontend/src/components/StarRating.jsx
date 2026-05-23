import React from 'react'

export default function StarRating({ score = 0, total = 0, size = 'sm', showCount = true }) {
  const full  = Math.floor(score)
  const half  = score - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  const sz    = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {Array.from({ length: full  }).map((_, i) => <Star key={`f${i}`} type="full"  cls={sz} />)}
        {half                                     &&  <Star key="h"       type="half"  cls={sz} />}
        {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} type="empty" cls={sz} />)}
      </div>
      {showCount && (
        <span className="text-[10px] font-black text-black/40 mt-0.5 tracking-widest">
          {score > 0 ? score.toFixed(1) : '0.0'}
          {total > 0 ? ` (${total})` : ''}
        </span>
      )}
    </div>
  )
}

function Star({ type, cls }) {
  const common = "transition-all duration-500 hover:scale-125"
  
  if (type === 'full')  return (
    <div className="relative group">
        <div className="absolute inset-0 bg-black blur-md opacity-0 group-hover:opacity-20 transition-opacity" />
        <svg className={`${cls} text-black ${common}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
    </div>
  )
  
  if (type === 'half')  return (
    <svg className={`${cls} text-black ${common}`} fill="currentColor" viewBox="0 0 20 20">
        <defs><linearGradient id="h"><stop offset="50%" stopColor="currentColor"/><stop offset="50%" stopColor="#e5e7eb"/></linearGradient></defs>
        <path fill="url(#h)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>
  )
  
  return (
    <svg className={`${cls} text-black/10 ${common}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>
  )
}
