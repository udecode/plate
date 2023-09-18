import { RenderAfterEditable } from '@udecode/plate-common';
import { LinkPlugin } from '@udecode/plate-link';

import { MyPlatePlugin } from '@/types/plate-types';
import { LinkFloatingToolbar } from '@/registry/default/plate-ui/link-floating-toolbar';

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,
};
