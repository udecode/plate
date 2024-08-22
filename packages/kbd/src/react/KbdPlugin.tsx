import { toPlatePlugin } from '@udecode/plate-common/react';

import { KbdPlugin as BaseKbdPlugin } from '../lib/KbdPlugin';

/** Enables support for code formatting with React-specific features */
export const KbdPlugin = toPlatePlugin(BaseKbdPlugin);
