import { toPlatePlugin } from '@platejs/core/react';

import { BaseSlashInputPlugin, BaseSlashPlugin } from '../lib';

export const SlashInputPlugin = toPlatePlugin(BaseSlashInputPlugin);

export const SlashPlugin = toPlatePlugin(BaseSlashPlugin, {
  dependencies: [SlashInputPlugin],
});
