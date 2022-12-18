import { createRef, RefObject } from 'react';
import { EmojiCategoryList } from '../../types';
import { AGridSection, Grid } from '../Grid';

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
