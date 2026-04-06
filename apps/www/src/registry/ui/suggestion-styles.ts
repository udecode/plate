import { cva } from 'class-variance-authority';
import { KEYS } from 'platejs';

import { cn } from '@/lib/utils';

export const suggestionVariants = cva(
  cn(
    'bg-emerald-100 text-emerald-700 no-underline transition-colors duration-200'
  ),
  {
    defaultVariants: {
      insertActive: false,
      remove: false,
      removeActive: false,
    },
    variants: {
      insertActive: {
        false: '',
        true: 'bg-emerald-200/80',
      },
      remove: {
        false: '',
        true: 'bg-red-100 text-red-700',
      },
      removeActive: {
        false: '',
        true: 'bg-red-200/80 no-underline',
      },
    },
  }
);

export function getBlockSuggestionWrapperClassName({
  elementType,
  isActive,
  isHover,
  isInsert,
  isRemove,
}: {
  elementType?: string;
  isActive: boolean;
  isHover: boolean;
  isInsert: boolean;
  isRemove: boolean;
}) {
  return cn(
    elementType === KEYS.columnGroup && 'flex size-full rounded',
    suggestionVariants({
      insertActive: isInsert && (isActive || isHover),
      remove: isRemove,
      removeActive: (isActive || isHover) && isRemove,
    })
  );
}
