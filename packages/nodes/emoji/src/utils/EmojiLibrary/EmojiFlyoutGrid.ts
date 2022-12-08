import { createRef } from 'react';
import { EmojiCategoryList } from '../../types';
import { IEmojiFlyoutGrid } from './EmojiFlyoutGrid.types';
import {
  EmojisListType,
  GridRow,
  TGridCategory,
} from './EmojiFlyoutLibrary.types';

export class EmojiFlyoutGrid implements IEmojiFlyoutGrid {
  private perLine = 8;
  private grid = new Map<EmojiCategoryList, TGridCategory>();

  constructor(categories: EmojiCategoryList[], emojis: EmojisListType) {
    this.init(categories, emojis);
  }

  private init(categories: EmojiCategoryList[], emojis: EmojisListType) {
    let rowsCount = 0;
    categories.forEach((categoryId) => {
      const rows = this.initRows(emojis[categoryId as any], rowsCount);
      rowsCount += rows.length;
      this.grid.set(categoryId, { root: createRef(), rows });
    });
  }

  private initRows(emojis: string[], index: number) {
    const rows: GridRow[] = [];
    let loop = Math.floor(emojis.length / this.perLine);
    if (emojis.length % this.perLine !== 0) {
      loop++;
    }

    let i = 0;
    while (i < loop) {
      this.addRow(rows, emojis, i, index + ++i);
    }

    return rows;
  }

  private addRow(
    rows: GridRow[],
    emojis: string[],
    lastPosition: number,
    rowIndex: number
  ) {
    const start = lastPosition * this.perLine;
    const end = start + this.perLine;
    rows.push({
      emojis: emojis.slice(start, end),
      id: rowIndex,
    });
  }

  public values() {
    return this.grid.values();
  }

  public section(sectionId: EmojiCategoryList) {
    return this.grid.get(sectionId)!;
  }
}
