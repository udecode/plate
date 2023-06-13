import { TEditableProps } from '@udecode/plate-common';

import { cn } from '@/lib/utils';
import { MyValue } from '@/plate/plate.types';

export const editableProps: TEditableProps<MyValue> = {
  spellCheck: false,
  autoFocus: false,
  placeholder: 'Type…',
  style: {
    outline: 'none',
  },
  className: cn(
    'relative max-w-full px-[96px] pb-[20vh] pt-4 leading-[1.4] [&_strong]:font-bold'
  ),
};
