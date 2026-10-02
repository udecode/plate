import { BaseSlashPlugin } from '../../../features/slash-command/lib';
import { toReactPlugin } from '../../core';

export const SlashPlugin = toReactPlugin(BaseSlashPlugin);
