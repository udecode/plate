import React from 'react';

import {
  type EmojiCategoryList,
  type IGrid,
  AGridSection,
  Grid,
} from '../../../lib';

export type EmojiFloatingGridType = IGrid<
  React.RefObject<HTMLDivElement | null>,
  EmojiCategoryList
>;

export class EmojiFloatingGrid extends Grid<
  React.RefObject<HTMLDivElement | null>,
  EmojiCategoryList
> {
  public createRootRef() {
    return React.createRef<HTMLDivElement>();
  }
}

export class EmojiGridSectionWithRoot extends AGridSection<
  React.RefObject<HTMLDivElement | null>,
  EmojiCategoryList
> {
  protected createRootRef() {
    this._root = React.createRef<HTMLDivElement>();
  }
}
