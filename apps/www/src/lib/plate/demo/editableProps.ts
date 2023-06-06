import { TEditableProps } from '@udecode/plate-common';

import { MyValue } from '@/plate/plate.types';

export const editableProps: TEditableProps<MyValue> = {
  spellCheck: false,
  autoFocus: false,
  placeholder: 'Type…',
  style: {
    outline: 'none',
  },
};
