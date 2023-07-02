import { RenderAfterEditable } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { LinkPlugin } from '@udecode/plate-link';

import { LinkFloatingToolbar } from '@/components/plate-ui/link-floating-toolbar';

export const linkPlugin: Partial<PlatePlugin<LinkPlugin>> = {
  renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,
};
