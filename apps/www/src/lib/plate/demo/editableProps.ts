import { PlateContentProps } from '@udecode/plate-common';

import { cn } from '@/lib/utils';

export const editableProps: PlateContentProps = {
  spellCheck: false,
  autoFocus: false,
  placeholder: 'Type…',
  style: {
    outline: 'none',
  },
  className: cn('relative max-w-full [&_strong]:font-bold'),
};
