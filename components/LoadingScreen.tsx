
import React, { useState, useEffect } from 'react';

const messages = [
  "正在开启命盘之门...",
  "解析紫微星位中...",
  "推演流年运势...",
  "查阅四化吉凶...",
  "大师正在凝神推演...",
  "天机不可泄露，稍等片刻...",
  "正在整理命理建议..."
];

const LoadingScreen: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80 backdrop-blur-md">
      <div className="relative w-48 h-48 mb-8">
        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-4 border-2 border-amber-400 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fa-solid fa-yin-yang text-6xl text-amber-500 animate-pulse"></i>
        </div>
      </div>
      <p className="text-2xl font-bold text-amber-200 serif animate-pulse">
        {messages[index]}
      </p>
      <div className="mt-8 w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500 shimmer w-full"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
