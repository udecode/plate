export const linkPluginCode = `import { LinkPlugin, PlateFloatingLink } from '@udecode/plate';
import { MyPlatePlugin } from '../typescript/plateTypes';

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: PlateFloatingLink,
};
`;

export const linkPluginFile = {
  '/link/linkPlugin.tsx': linkPluginCode,
};
