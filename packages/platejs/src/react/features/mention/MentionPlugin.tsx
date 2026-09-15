import {
  BaseMentionInputPlugin,
  BaseMentionPlugin,
} from '../../../features/mention/lib';
import { toReactPlugin } from '../../core';

export const MentionInputPlugin = toReactPlugin(BaseMentionInputPlugin);

export const MentionPlugin = toReactPlugin(BaseMentionPlugin, {
  dependencies: [MentionInputPlugin],
});
