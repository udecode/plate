export const softBreakPluginCode = `import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_TD,
  SoftBreakPlugin,
} from '@udecode/plate';
import { MyPlatePlugin } from '../typescript/plateTypes';

export const softBreakPlugin: Partial<MyPlatePlugin<SoftBreakPlugin>> = {
  options: {
    rules: [
      { hotkey: 'shift+enter' },
      {
        hotkey: 'enter',
        query: {
          allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD],
        },
      },
    ],
  },
};
`;

export const softBreakPluginFile = {
  '/soft-break/softBreakPlugin.ts': softBreakPluginCode,
};
