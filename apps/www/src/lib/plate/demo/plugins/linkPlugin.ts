import { LinkPlugin, RenderAfterEditable } from '@udecode/plate';

import { LinkFloatingToolbar } from '@/plate/aui/link-floating-toolbar';
import { MyPlatePlugin, MyValue } from '@/types/plate.types';

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable<MyValue>,
};
