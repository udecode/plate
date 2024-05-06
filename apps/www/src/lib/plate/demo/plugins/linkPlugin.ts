import type { PlatePlugin, RenderAfterEditable } from '@udecode/plate-common';
import type { LinkPlugin } from '@udecode/plate-link';

import { LinkFloatingToolbar } from '@/registry/default/plate-ui/link-floating-toolbar';

export const linkPlugin: Partial<PlatePlugin<LinkPlugin>> = {
  renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,
};
