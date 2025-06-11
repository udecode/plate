import { toPlatePlugin } from 'platejs/react';

import { BaseSlashInputPlugin, BaseSlashPlugin } from '../lib';

export const SlashInputPlugin = toPlatePlugin(BaseSlashInputPlugin);

export const SlashPlugin = toPlatePlugin(BaseSlashPlugin);
