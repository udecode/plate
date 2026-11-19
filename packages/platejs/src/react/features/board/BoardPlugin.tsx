import {
  BaseBoardArrowPlugin,
  BaseBoardFramePlugin,
  BaseBoardGeoPlugin,
  BaseBoardImagePlugin,
  BaseBoardNotePlugin,
  BaseBoardPlugin,
  BaseBoardStrokePlugin,
} from '../../../features/board/lib';
import { toReactPlugin } from '../../core';

export const BoardPlugin = toReactPlugin(BaseBoardPlugin);

export const BoardNotePlugin = toReactPlugin(BaseBoardNotePlugin);

export const BoardGeoPlugin = toReactPlugin(BaseBoardGeoPlugin);

export const BoardArrowPlugin = toReactPlugin(BaseBoardArrowPlugin);

export const BoardFramePlugin = toReactPlugin(BaseBoardFramePlugin);

export const BoardStrokePlugin = toReactPlugin(BaseBoardStrokePlugin);

/**
 * A picture on a board, holding at most one image element or upload draft. The
 * board keeps it selected as an object, since it holds no text a caret can
 * enter.
 */
export const BoardImagePlugin = toReactPlugin(BaseBoardImagePlugin);
