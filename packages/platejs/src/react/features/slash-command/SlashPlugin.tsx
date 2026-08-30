import {
  BaseSlashInputPlugin,
  BaseSlashPlugin,
} from '../../../features/slash-command/lib';
import { toPlatePlugin } from '../../core';

export const SlashInputPlugin = toPlatePlugin(BaseSlashInputPlugin);

export const SlashPlugin = toPlatePlugin(BaseSlashPlugin, {
  dependencies: [SlashInputPlugin],
});
