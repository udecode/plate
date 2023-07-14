import { createRef, RefObject } from 'react';

import { EmojiCategoryList } from '../../types';
import { AGridSection, Grid, IGrid } from '../Grid/index';

export type EmojiFloatingGridType = IGrid<
  RefObject<HTMLDivElement>,
  EmojiCategoryList
>;

export class EmojiFloatingGrid extends Grid<
  RefObject<HTMLDivElement>,
  EmojiCategoryList
> {
  public createRootRef() {
    return createRef<HTMLDivElement>();
  }
}

export class EmojiGridSectionWithRoot extends AGridSection<
  RefObject<HTMLDivElement>,
  EmojiCategoryList
> {
  protected createRootRef() {
    this._root = createRef<HTMLDivElement>();
  }
}
