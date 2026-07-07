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
      const target = e.target as HTMLElement | null;
      const isInteractive = !!(
        target && (
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('button') ||
          target.closest('a') ||
          target.classList.contains('cursor-pointer')
        )
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
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        width: '44px',
        height: '44px',
        marginLeft: '-22px',
        marginTop: '-22px',
        willChange: 'transform',
      }}
    >
      {/* Outer liquid lens with reflection highlights */}
      <div
        className={`w-full h-full rounded-full border border-white/30 backdrop-blur-[4px] shadow-[0_8px_32px_0_rgba(14,165,233,0.25),inset_0_2px_6px_0_rgba(255,255,255,0.4),inset_0_-4px_8px_0_rgba(0,0,0,0.15)] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
          isHoveringClickable
            ? 'scale-150 border-sky-400/60 bg-sky-500/10 shadow-[0_12px_40px_0_rgba(56,189,248,0.45),inset_0_2px_8px_0_rgba(255,255,255,0.5)]'
            : 'scale-100 bg-white/5'
        }`}
      >
        {/* iOS style specular bubble reflection glint */}
        <div className="absolute top-1.5 left-2 w-3 h-1.5 bg-white/40 rounded-full rotate-[-15deg] blur-[0.5px]" />
        <div className="absolute bottom-2 right-2.5 w-1.5 h-1.5 bg-sky-300/30 rounded-full blur-[0.2px]" />
      </div>
    </div>
  );
}
