import { PlateProps } from '@udecode/plate';
import { MyEditor, MyValue } from './typescript/plate.types';

export const plateProps: PlateProps<MyValue, MyEditor> = {
  editableProps: {
    spellCheck: false,
    autoFocus: false,
    placeholder: 'Type…',
    style: {
      padding: '15px',
    },
  },
};
