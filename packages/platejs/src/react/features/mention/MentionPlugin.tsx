import {
  BaseMentionInputPlugin,
  BaseMentionPlugin,
} from '../../../features/mention/lib';
import { toPlatePlugin } from '../../core';

export const MentionInputPlugin = toPlatePlugin(BaseMentionInputPlugin);

export const MentionPlugin = toPlatePlugin(BaseMentionPlugin, {
  dependencies: [MentionInputPlugin],
});
