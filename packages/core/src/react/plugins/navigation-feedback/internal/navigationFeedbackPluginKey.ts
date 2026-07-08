import type { WithRequiredKey } from '../../../../lib/plugin';

import {
  NAVIGATION_FEEDBACK_KEY,
  type NavigationFeedbackConfig,
} from '../types';

export const NavigationFeedbackPluginKey: WithRequiredKey<NavigationFeedbackConfig> =
  {
    key: NAVIGATION_FEEDBACK_KEY,
  };
