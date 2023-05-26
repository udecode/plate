import { LinkPlugin, RenderAfterEditable } from '@udecode/plate';

import { MyPlatePlugin, MyValue } from '@/plate/demo/plate.types';
import { FloatingLink } from '@/plate/link/FloatingLink';

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: FloatingLink as RenderAfterEditable<MyValue>,
};
