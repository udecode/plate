import { TEditableProps } from '@udecode/plate-common';

import { cn } from '@/lib/utils';

export const editableProps: TEditableProps<any> = {
  spellCheck: false,
  autoFocus: false,
  placeholder: 'Type…',
  style: {
    outline: 'none',
  },
  className: cn('relative max-w-full leading-[1.4] [&_strong]:font-bold'),
};
