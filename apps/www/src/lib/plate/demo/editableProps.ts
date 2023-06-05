import { TEditableProps } from '@udecode/plate-common';
import { MyValue } from '../../../types/plate.types';

export const editableProps: TEditableProps<MyValue> = {
  spellCheck: false,
  autoFocus: false,
  placeholder: 'Type…',
};
