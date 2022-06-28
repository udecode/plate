export const selectOnBackspacePluginCode = `import {
  ELEMENT_HR,
  ELEMENT_IMAGE,
  SelectOnBackspacePlugin,
} from '@udecode/plate';
import { MyPlatePlugin } from '../typescript/plateTypes';

export const selectOnBackspacePlugin: Partial<
  MyPlatePlugin<SelectOnBackspacePlugin>
> = {
  options: {
    query: {
      allow: [ELEMENT_IMAGE, ELEMENT_HR],
    },
  },
};
`;

export const selectOnBackspacePluginFile = {
  '/select-on-backspace/selectOnBackspacePlugin.ts': selectOnBackspacePluginCode,
};
