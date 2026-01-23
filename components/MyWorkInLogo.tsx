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
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Logo W - Parte inferior izquierda (azul oscuro #005691) - Base del W */}
      <path
        d="M8 52L8 40C8 28.954 16.954 20 28 20H32C43.046 20 52 28.954 52 40V52L46 60H18L8 52Z"
        fill="#005691"
      />
      {/* Logo W - Parte superior derecha (azul claro #0078D4) - Parte superior del W */}
      <path
        d="M20 4H28C39.046 4 48 12.954 48 24V36L42 44H30L22 36V24C22 12.954 20 4 20 4Z"
        fill="#0078D4"
      />
      {/* Parte central que conecta ambas partes del W */}
      <path
        d="M24 8H32C38.627 8 44 13.373 44 20V28L38 36H30L22 28V20C22 13.373 24 8 24 8Z"
        fill="#0078D4"
        opacity="0.85"
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
      <span className={`font-bold ${currentSize.text} tracking-tight ${className.includes('text-white') ? 'text-white' : 'text-[#005691]'}`}>
        MyWorkIn
      </span>
    </div>
  );
}
