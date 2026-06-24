import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 font-medium text-xs',
  {
    defaultVariants: {
      variant: 'secondary',
    },
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        outline: 'border-border text-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
      },
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      className={cn(badgeVariants({ className, variant }))}
      data-slot="badge"
      {...props}
    />
  )
}

export { Badge, badgeVariants }
