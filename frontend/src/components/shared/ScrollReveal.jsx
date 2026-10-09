import React, { useRef, useEffect, useState } from 'react';

const ScrollReveal = ({ children, className = '', animation = 'fade-up', delay = 0, duration = 700 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);

  let animationClass = '';
  switch (animation) {
    case 'fade-up':
      animationClass = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';
      break;
    case 'fade-left':
      animationClass = isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10';
      break;
    case 'fade-right':
      animationClass = isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10';
      break;
    case 'scale-up':
      animationClass = isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95';
      break;
    case 'fade':
      animationClass = isVisible ? 'opacity-100' : 'opacity-0';
      break;
    default:
      animationClass = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';
  }

  return (
    <div
      ref={ref}
      className={`transition-all transform ${animationClass} ${className}`}
      style={{ 
        transitionDuration: `${duration}ms`, 
        transitionDelay: `${delay}ms`, 
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' 
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
