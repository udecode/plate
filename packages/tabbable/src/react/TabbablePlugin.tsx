import { extendPlugin } from '@udecode/plate-common/react';

import { TabbablePlugin as BaseTabbablePlugin } from '../lib/TabbablePlugin';
import { TabbableEffects } from './TabbableEffects';

export const TabbablePlugin = extendPlugin(BaseTabbablePlugin, {
  renderAfterEditable: TabbableEffects,
});
