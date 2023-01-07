export const linkPluginCode = `import {
  LinkPlugin,
  PlateFloatingLink,
  RenderAfterEditable,
} from '@udecode/plate';
import { MyPlatePlugin, MyValue } from '../typescript/plateTypes';

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: PlateFloatingLink as RenderAfterEditable<MyValue>,
};
`;

export const linkPluginFile = {
  '/link/linkPlugin.tsx': linkPluginCode,
};
