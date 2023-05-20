import { TEditableProps } from '@udecode/plate';
import { MyValue } from '../../apps/next/src/lib/plate/typescript/plateTypes';

export const editableProps: TEditableProps<MyValue> = {
  spellCheck: false,
  autoFocus: false,
  placeholder: 'Type…',
};
