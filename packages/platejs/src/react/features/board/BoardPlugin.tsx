import {
  BaseBoardGeoPlugin,
  BaseBoardNotePlugin,
  BaseBoardPlugin,
} from '../../../features/board/lib';
import { toReactPlugin } from '../../core';

export const BoardPlugin = toReactPlugin(BaseBoardPlugin);

export const BoardNotePlugin = toReactPlugin(BaseBoardNotePlugin);

export const BoardGeoPlugin = toReactPlugin(BaseBoardGeoPlugin);
