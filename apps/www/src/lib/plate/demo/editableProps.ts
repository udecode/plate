import { TEditableProps } from '@udecode/plate';

import { MyValue } from '@/plate/typescript/plateTypes';

export const editableProps: TEditableProps<MyValue> = {
  spellCheck: false,
  autoFocus: false,
  placeholder: 'Type…',
};
