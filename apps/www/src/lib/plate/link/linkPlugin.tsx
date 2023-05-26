import { LinkPlugin, RenderAfterEditable } from '@udecode/plate';
import { FloatingLink } from './FloatingLink';

import { MyPlatePlugin, MyValue } from '@/plate/typescript/plateTypes';

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: FloatingLink as RenderAfterEditable<MyValue>,
};
