import { extendPlatePlugin } from '@udecode/plate-common/react';

import { TabbablePlugin as BaseTabbablePlugin } from '../lib/TabbablePlugin';
import { TabbableEffects } from './TabbableEffects';

export const TabbablePlugin = extendPlatePlugin(BaseTabbablePlugin, {
  renderAfterEditable: TabbableEffects,
});
