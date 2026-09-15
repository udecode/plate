import {
  BaseSlashInputPlugin,
  BaseSlashPlugin,
} from '../../../features/slash-command/lib';
import { toReactPlugin } from '../../core';

export const SlashInputPlugin = toReactPlugin(BaseSlashInputPlugin);

export const SlashPlugin = toReactPlugin(BaseSlashPlugin, {
  dependencies: [SlashInputPlugin],
});
