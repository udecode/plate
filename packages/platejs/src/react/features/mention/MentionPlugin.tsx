import { BaseMentionPlugin } from '../../../features/mention/lib';
import { toReactPlugin } from '../../core';

export const MentionPlugin = toReactPlugin(BaseMentionPlugin);
