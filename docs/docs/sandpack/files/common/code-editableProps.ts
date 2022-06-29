export const editablePropsCode = `import { TEditableProps } from '@udecode/plate';
import { MyValue } from '../typescript/plateTypes';

export const editableProps: TEditableProps<MyValue> = {
  spellCheck: false,
  autoFocus: false,
  placeholder: 'Type…',
};
`;

export const editablePropsFile = {
  '/common/editableProps.ts': editablePropsCode,
};
