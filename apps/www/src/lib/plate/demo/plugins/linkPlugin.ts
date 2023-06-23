import { RenderAfterEditable } from '@udecode/plate-common';
import { LinkPlugin } from '@udecode/plate-link';

import { MyPlatePlugin, MyValue } from '@/plate/plate-types';
import { LinkFloatingToolbar } from '@/registry/default/ui/link-floating-toolbar';

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable<MyValue>,
};
