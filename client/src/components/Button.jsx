import React from "react"

export function Button({ children, className, variant, ...props }) {
  const baseStyle = "px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  }

  const style = `${baseStyle} ${variantStyles[variant || "default"]} ${className || ""}`

  return (
    <button className={style} {...props}>
      {children}
    </button>
  )
}

