import {
  BaseBoardArrowPlugin,
  BaseBoardFramePlugin,
  BaseBoardGeoPlugin,
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
