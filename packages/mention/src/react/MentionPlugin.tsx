import { toPlatePlugin } from '@platejs/core/react';

import { BaseMentionInputPlugin, BaseMentionPlugin } from '../lib';

export const MentionInputPlugin = toPlatePlugin(BaseMentionInputPlugin);

export const MentionPlugin = toPlatePlugin(BaseMentionPlugin, {
  dependencies: [MentionInputPlugin],
});
