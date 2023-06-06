import { RenderAfterEditable } from '@udecode/plate-common';
import { LinkPlugin } from '@udecode/plate-link';

import { LinkFloatingToolbar } from '@/components/plate-ui/link-floating-toolbar';
import { MyPlatePlugin, MyValue } from '@/plate/plate.types';

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable<MyValue>,
};
