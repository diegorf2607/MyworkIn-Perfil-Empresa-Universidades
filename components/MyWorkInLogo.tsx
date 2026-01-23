import React from "react"

interface MyWorkInLogoProps {
  variant?: "icon" | "full" | "horizontal"
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function MyWorkInLogo({
  variant = "horizontal",
  className = "",
  size = "md",
}: MyWorkInLogoProps) {
  const sizeClasses = {
    sm: { icon: 24, logo: { width: 180, height: 48 } },
    md: { icon: 32, logo: { width: 240, height: 64 } },
    lg: { icon: 48, logo: { width: 320, height: 84 } },
  }

  const currentSize = sizeClasses[size]
  const useWhite = className.includes("text-white")
  const iconClassName = "flex-shrink-0"
  const iconSrc = useWhite
    ? "/images/myworkin-logo-white.svg"
    : "/images/myworkin-logo.png"
  const logoSrc = "/images/MyWorkIn (1).png"

  const Icon = () => (
    <img
      src={iconSrc}
      alt="MyWorkIn"
      width={currentSize.icon}
      height={currentSize.icon}
      className={iconClassName}
    />
  )
  const Logo = () => (
    <img
      src={logoSrc}
      alt="MyWorkIn"
      width={currentSize.logo.width}
      height={currentSize.logo.height}
      className={iconClassName}
    />
  )

  if (variant === "icon") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Icon />
      </div>
    )
  }

  if (variant === "full") {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Logo />
      </div>
    )
  }

  // horizontal (default)
  return (
    <div className={`inline-flex items-center ${className}`}>
      <Logo />
    </div>
  )
}
