import { PlatePlugin, RenderAfterEditable } from '@udecode/plate-common';
import { LinkPlugin } from '@udecode/plate-link';

import { LinkFloatingToolbar } from '@/components/plate-ui/link-floating-toolbar';

export const linkPlugin: Partial<PlatePlugin<LinkPlugin>> = {
  renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,
};
