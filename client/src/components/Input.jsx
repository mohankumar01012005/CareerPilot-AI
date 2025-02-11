import React from "react"

export function Input({ className, ...props }) {
  return (
    <input
      className={`px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className || ""}`}
      {...props}
    />
  )
}

