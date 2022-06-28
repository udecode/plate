export const trailingBlockPluginCode = `import { ELEMENT_PARAGRAPH, TrailingBlockPlugin } from '@udecode/plate';
import { MyPlatePlugin } from '../typescript/plateTypes';

export const trailingBlockPlugin: Partial<
  MyPlatePlugin<TrailingBlockPlugin>
> = {
  options: { type: ELEMENT_PARAGRAPH },
};
`;

export const trailingBlockPluginFile = {
  '/trailing-block/trailingBlockPlugin.ts': trailingBlockPluginCode,
};
