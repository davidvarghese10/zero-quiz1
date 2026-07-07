import React, { useEffect, useRef, useState } from 'react';

export default function GlassLensCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMouseMove = (e: MouseEvent) => {
      // Direct CSS modification avoids React re-render cycles for perfect 120Hz/60Hz lag-free performance
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!isVisible) setIsVisible(true);

      // Dynamically detect if hover target is interactive to trigger custom lens scale expansion
      const target = e.target as Element | null;
      const isInteractive = !!(
        target &&
        typeof target.closest === 'function' &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('button') ||
          target.closest('a') ||
          (target.classList && typeof target.classList.contains === 'function' && target.classList.contains('cursor-pointer')))
      );
      setIsHoveringClickable(isInteractive);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  return (
    <div
      ref={cursorRef}
      className={`pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block transition-opacity duration-300 ${
        isVisible ? 'opacity-70' : 'opacity-0'
      }`}
      style={{
        width: '24px',
        height: '24px',
        marginLeft: '-12px',
        marginTop: '-12px',
        willChange: 'transform',
      }}
    >
      {/* Outer liquid lens with reflection highlights */}
      <div
        className={`w-full h-full rounded-full border border-white/10 backdrop-blur-[1px] shadow-[0_4px_12px_0_rgba(14,165,233,0.08),inset_0_1px_2px_0_rgba(255,255,255,0.1),inset_0_-1px_3px_0_rgba(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
          isHoveringClickable
            ? 'scale-[1.5] border-sky-400/20 bg-sky-500/5 shadow-[0_6px_16px_0_rgba(56,189,248,0.12),inset_0_1px_3px_0_rgba(255,255,255,0.2)]'
            : 'scale-100 bg-white/[0.01]'
        }`}
      >
        {/* iOS style specular bubble reflection glint */}
        <div className="absolute top-1 left-1 w-1.5 h-0.5 bg-white/15 rounded-full rotate-[-15deg] blur-[0.2px]" />
        <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-sky-300/5 rounded-full blur-[0.1px]" />
      </div>
    </div>
  );
}
