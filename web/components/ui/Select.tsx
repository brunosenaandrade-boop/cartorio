'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  variant?: 'glass' | 'solid'
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, variant = 'solid', options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name

    const variants = {
      glass: 'bg-white/10 border-white/20 text-white focus:ring-primary-400',
      solid: 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-primary-400'
    }

    const labelVariants = {
      glass: 'text-white/90',
      solid: 'text-gray-700'
    }

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className={cn('block text-sm font-medium mb-1', labelVariants[variant])}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer',
              variants[variant],
              error && 'border-danger-500 focus:ring-danger-500',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none',
            variant === 'glass' ? 'text-white/50' : 'text-gray-400'
          )} />
        </div>
        {error && (
          <p className="mt-1 text-sm text-danger-500">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
