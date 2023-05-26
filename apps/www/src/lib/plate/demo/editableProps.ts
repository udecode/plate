import { TEditableProps } from '@udecode/plate';
import { MyValue } from './plate.types';

export const editableProps: TEditableProps<MyValue> = {
  spellCheck: false,
  autoFocus: false,
  placeholder: 'Type…',
};
