import { toPlatePlugin } from '@udecode/plate/react';

import { BaseTabbablePlugin } from '../lib/BaseTabbablePlugin';
import { TabbableEffects } from './TabbableEffects';

export const TabbablePlugin = toPlatePlugin(BaseTabbablePlugin, {
  render: { afterEditable: TabbableEffects },
});
