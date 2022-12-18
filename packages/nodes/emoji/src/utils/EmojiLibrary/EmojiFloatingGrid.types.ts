import { RefObject } from 'react';
import { EmojiCategoryList } from '../../types';
import { IGrid } from '../Grid/Grid.types';

export type EmojiFloatingGridType = IGrid<
  RefObject<HTMLDivElement>,
  EmojiCategoryList
>;
