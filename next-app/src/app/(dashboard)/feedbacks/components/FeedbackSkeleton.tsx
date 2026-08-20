import React from 'react';

export const FeedbackSkeleton = () => {
  return (
    <>
      {/* Top Banner Skeleton */}
      <div className="bg-white border border-line-soft rounded-[24px] py-10 px-10 mb-8 flex items-center justify-between overflow-hidden shadow-sm animate-pulse">
        <div className="flex items-center gap-8">
          <div className="w-[100px] h-[100px] rounded-full bg-line-soft"></div>
          <div>
            <div className="w-[250px] h-8 bg-line-soft rounded-lg mb-3"></div>
            <div className="w-[350px] h-4 bg-line-soft rounded-lg"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="w-20 h-14 bg-line-soft rounded-lg mb-2 ml-auto"></div>
          <div className="w-24 h-4 bg-line-soft rounded-lg ml-auto"></div>
        </div>
      </div>

      {/* 3 Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-line-soft rounded-[24px] p-8 animate-pulse shadow-sm">
            <div className="w-32 h-3 bg-line-soft rounded-lg mb-4"></div>
            <div className="w-16 h-10 bg-line-soft rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Filter Skeleton */}
      <div className="mb-8">
        <div className="w-full h-[58px] bg-line-soft rounded-full animate-pulse shadow-sm"></div>
      </div>
      <div className="flex gap-3 mb-10 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-10 bg-line-soft rounded-full ${i <= 3 ? 'w-24' : 'w-32'}`}></div>
        ))}
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white border border-line-soft rounded-[24px] p-8 animate-pulse shadow-sm flex flex-col h-[320px]">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-line-soft shrink-0"></div>
              <div className="flex-1">
                <div className="w-3/4 h-4 bg-line-soft rounded-lg mb-2"></div>
                <div className="w-1/2 h-3 bg-line-soft rounded-lg"></div>
              </div>
              <div className="w-12 h-7 rounded-full bg-line-soft shrink-0"></div>
            </div>
            
            <div className="flex-1">
              <div className="w-1/3 h-2.5 bg-line-soft rounded-lg mb-3"></div>
              <div className="w-full h-3 bg-line-soft rounded-lg mb-2"></div>
              <div className="w-5/6 h-3 bg-line-soft rounded-lg mb-6"></div>
              
              <div className="w-1/3 h-2.5 bg-line-soft rounded-lg mb-3"></div>
              <div className="w-full h-3 bg-line-soft rounded-lg mb-2"></div>
              <div className="w-4/5 h-3 bg-line-soft rounded-lg"></div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-line-soft mt-auto">
              <div className="w-20 h-3 bg-line-soft rounded-lg"></div>
              <div className="w-16 h-5 rounded-full bg-line-soft"></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
