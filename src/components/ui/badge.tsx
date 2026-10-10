import { cn } from '../../lib/utils'
import type { ComponentProps } from 'react'

export function Badge({ className, variant = 'default', children, ...props }: ComponentProps<'div'> & { variant?: 'default' | 'outline' | 'success' | 'warning' | 'error' }) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    outline: 'text-foreground border border-input',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
