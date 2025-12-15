'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  variant?: 'glass' | 'solid'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, variant = 'solid', id, ...props }, ref) => {
    const inputId = id || props.name

    const variants = {
      glass: 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-primary-400',
      solid: 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-primary-400'
    }

    const labelVariants = {
      glass: 'text-white/90',
      solid: 'text-gray-700'
    }

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn('block text-sm font-medium mb-1', labelVariants[variant])}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200',
            variants[variant],
            error && 'border-danger-500 focus:ring-danger-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-danger-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
