import React from 'react';

interface MyWorkInLogoProps {
  variant?: 'icon' | 'full' | 'horizontal';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function MyWorkInLogo({ 
  variant = 'horizontal', 
  className = '',
  size = 'md' 
}: MyWorkInLogoProps) {
  const sizeClasses = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' }
  };

  const currentSize = sizeClasses[size];

  const Icon = () => (
    <svg
      width={currentSize.icon}
      height={currentSize.icon}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Elemento inferior (azul oscuro #005691) - Base izquierda */}
      <path
        d="M8 40L8 28C8 18.059 16.059 10 26 10H30C39.941 10 48 18.059 48 28V40L42 46H14L8 40Z"
        fill="#005691"
      />
      {/* Elemento superior (azul claro #0078D4) - Parte superior derecha */}
      <path
        d="M18 6H26C35.941 6 44 14.059 44 24V36L38 42H26L18 34V24C18 14.059 18 6 18 6Z"
        fill="#0078D4"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Icon />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Icon />
        <span className={`font-bold ${currentSize.text} text-[#005691]`}>
          MyWorkIn
        </span>
      </div>
    );
  }

  // horizontal (default)
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <Icon />
      <span className={`font-bold ${currentSize.text} text-[#005691] tracking-tight`}>
        MyWorkIn
      </span>
    </div>
  );
}
