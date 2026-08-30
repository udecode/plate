import { BaseCommentPlugin } from '../../../features/comment/lib';
import { toPlatePlugin } from '../../core';

export const CommentPlugin = toPlatePlugin(BaseCommentPlugin);
