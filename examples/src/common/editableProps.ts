import { TEditableProps } from '@udecode/plate';
import { MyValue } from '../typescript/plateTypes';

export const editableProps: TEditableProps<MyValue> = {
  spellCheck: false,
  autoFocus: false,
  readOnly: false,
  placeholder: 'Type…',
};
