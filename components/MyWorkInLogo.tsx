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
      {/* Logo W - Forma de W estilizada con efecto de flecha/chevron */}
      {/* Parte izquierda inferior (azul oscuro #005691) */}
      <path
        d="M8 56L8 44C8 32.954 16.954 24 28 24H30C41.046 24 50 32.954 50 44V56L44 62H20L8 56Z"
        fill="#005691"
      />
      {/* Parte derecha superior (azul claro #0078D4) */}
      <path
        d="M14 0H30C41.046 0 50 8.954 50 20V32L44 38H28L14 24V20C14 8.954 14 0 14 0Z"
        fill="#0078D4"
      />
      {/* Parte central del W (azul claro #0078D4) */}
      <path
        d="M20 4H36C42.627 4 48 9.373 48 16V24L42 30H28L20 22V16C20 9.373 20 4 20 4Z"
        fill="#0078D4"
        opacity="0.9"
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
