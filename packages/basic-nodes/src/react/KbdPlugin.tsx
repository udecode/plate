import { toPlatePlugin } from 'platejs/react';

import { BaseKbdPlugin } from '../lib/BaseKbdPlugin';

/** Enables support for code formatting with React-specific features */
export const KbdPlugin = toPlatePlugin(BaseKbdPlugin);
