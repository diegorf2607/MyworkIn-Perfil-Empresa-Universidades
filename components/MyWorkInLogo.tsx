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
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 48, text: "text-2xl" },
  }

  const currentSize = sizeClasses[size]
  const useWhite = className.includes("text-white")
  const iconClassName = "flex-shrink-0"
  const logoSrc = useWhite
    ? "/images/myworkin-logo-white.svg"
    : "/images/MyWorkIn (1).png"

  const Icon = () => (
    <img
      src={logoSrc}
      alt="MyWorkIn"
      width={currentSize.icon}
      height={currentSize.icon}
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
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Icon />
        <span className={`font-bold ${currentSize.text} ${useWhite ? "text-white" : "text-[#005691]"}`}>
          MyWorkIn
        </span>
      </div>
    )
  }

  // horizontal (default)
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <Icon />
      <span className={`font-bold ${currentSize.text} tracking-tight ${useWhite ? "text-white" : "text-[#005691]"}`}>
        MyWorkIn
      </span>
    </div>
  )
}
