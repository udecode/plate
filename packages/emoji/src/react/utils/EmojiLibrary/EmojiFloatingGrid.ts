import React from 'react';

import type { EmojiCategoryList } from '../../../lib/types';
import { Grid } from '../../../lib/utils/Grid/Grid';
import { AGridSection } from '../../../lib/utils/Grid/GridSection';
import type { IGrid } from '../../../lib/utils/Grid/Grid.types';

export type EmojiFloatingGridType = IGrid<
  React.RefObject<HTMLDivElement | null>,
  EmojiCategoryList
>;

export class EmojiFloatingGrid extends Grid<
  React.RefObject<HTMLDivElement | null>,
  EmojiCategoryList
> {
  createRootRef() {
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
