export const exitBreakPluginCode = `import { ExitBreakPlugin, KEYS_HEADING } from '@udecode/plate';
import { MyPlatePlugin } from '../typescript/plateTypes';

export const exitBreakPlugin: Partial<MyPlatePlugin<ExitBreakPlugin>> = {
  options: {
    rules: [
      {
        hotkey: 'mod+enter',
      },
      {
        hotkey: 'mod+shift+enter',
        before: true,
      },
      {
        hotkey: 'enter',
        query: {
          start: true,
          end: true,
          allow: KEYS_HEADING,
        },
        relative: true,
      },
    ],
  },
};
`;

export const exitBreakPluginFile = {
  '/exit-break/exitBreakPlugin.ts': exitBreakPluginCode,
};
