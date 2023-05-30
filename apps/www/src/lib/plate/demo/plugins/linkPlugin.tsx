import { LinkPlugin, RenderAfterEditable } from '@udecode/plate';

import { FloatingLink } from '@/plate/aui/floating-link';
import { MyPlatePlugin, MyValue } from '@/plate/demo/plate.types';

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: FloatingLink as RenderAfterEditable<MyValue>,
};
