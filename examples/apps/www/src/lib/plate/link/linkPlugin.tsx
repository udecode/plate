import { LinkPlugin, RenderAfterEditable } from '@udecode/plate';
import { PlateFloatingLink } from './PlateFloatingLink';

import { MyPlatePlugin, MyValue } from '@/plate/typescript/plateTypes';

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: PlateFloatingLink as RenderAfterEditable<MyValue>,
};
