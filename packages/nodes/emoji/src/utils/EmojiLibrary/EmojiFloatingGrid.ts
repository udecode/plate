import { createRef, RefObject } from 'react';
import { EmojiCategoryList } from '../../types';
import { AGrid } from '../Grid';

export class EmojiFloatingGrid extends AGrid<
  RefObject<HTMLDivElement>,
  EmojiCategoryList
> {
  public createRootRef() {
    return createRef<HTMLDivElement>();
  }
}
