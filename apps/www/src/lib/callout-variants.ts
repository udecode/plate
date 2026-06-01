export type CalloutType =
  | 'destructive'
  | 'error'
  | 'info'
  | 'note'
  | 'success'
  | 'warn'
  | 'warning';

export type CalloutVariant =
  | 'default'
  | 'destructive'
  | 'info'
  | 'success'
  | 'warning';

export function getCalloutVariant({
  type,
  variant = 'default',
}: {
  type?: CalloutType;
  variant?: CalloutVariant;
}): CalloutVariant {
  if (!type) return variant;

  switch (type) {
    case 'destructive':
    case 'error':
      return 'destructive';
    case 'info':
    case 'note':
      return 'info';
    case 'success':
      return 'success';
    case 'warn':
    case 'warning':
      return 'warning';
  }
}

export function getCalloutVariantClassName(variant: CalloutVariant) {
  switch (variant) {
    case 'destructive':
      return 'border-destructive/50 bg-destructive/10 dark:bg-destructive/20';
    case 'info':
      return 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/30';
    case 'success':
      return 'border-emerald-600 bg-emerald-100 dark:border-emerald-400 dark:bg-emerald-900';
    case 'warning':
      return 'border-orange-500/50 bg-orange-50 dark:bg-orange-950/30';
    default:
      return null;
  }
}
