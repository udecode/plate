import { cn } from '@/lib/utils';
import {
  type CalloutVariant,
  getCalloutVariantClassName,
} from '@/lib/callout-variants';

import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function Callout({
  title,
  children,
  icon,
  className,
  variant = 'default',
  ...props
}: Omit<React.ComponentProps<typeof Alert>, 'variant'> & {
  icon?: React.ReactNode;
  variant?: CalloutVariant;
}) {
  return (
    <Alert
      data-variant={variant}
      className={cn(
        'md:-mx-1 mt-6 w-auto rounded-xl border-surface bg-surface text-surface-foreground **:[code]:border',
        getCalloutVariantClassName(variant),
        className
      )}
      {...props}
    >
      {icon}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription className="text-card-foreground/80">
        {children}
      </AlertDescription>
    </Alert>
  );
}
