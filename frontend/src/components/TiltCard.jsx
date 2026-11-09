import React, { useRef, useState } from 'react';

export default function TiltCard({ 
  children, 
  className = '', 
  glowColor = 'rgba(113, 60, 255, 0.3)',
  maxTilt = 10,
  scale = 1.02
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`);
    
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.18 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transform,
        transition: transform ? 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform'
      }}
      className={`relative overflow-hidden transition-shadow duration-300 ${className}`}
    >
      {/* Dynamic Specular Glare Reflection */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 350px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.25), transparent 70%)`,
          opacity: glarePos.opacity
        }}
      />
      
      {/* Subtle Glow Backdrop */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          boxShadow: `0 0 35px ${glowColor}`
        }}
      />

      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
