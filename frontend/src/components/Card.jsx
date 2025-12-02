import React from 'react'

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg p-4 m-10 ${className}`}>
      {children}
    </div>
  )
}
