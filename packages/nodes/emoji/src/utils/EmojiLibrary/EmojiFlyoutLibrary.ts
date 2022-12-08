import { createRef } from 'react';
import emojiMartData from '@emoji-mart/data';
import { DEFAULT_FREQUENTLY_USED_EMOJI } from '../../constants';
import { EmojiCategoryList } from '../../types';
import {
  GridRow,
  IEmojiFlyoutLibrary,
  TGridCategory,
} from './EmojiFlyoutLibrary.types';
import { EmojiInlineLibrary } from './EmojiInlineLibrary';
import { EmojiLibrary } from './EmojiLibrary.types';

export class EmojiFlyoutLibrary
  extends EmojiInlineLibrary
  implements IEmojiFlyoutLibrary {
  private static instance?: EmojiFlyoutLibrary;

  private perLine = 8;
  private categories: EmojiCategoryList[] = [];
  private emojis: Partial<Record<EmojiCategoryList, string[]>> = {};
  private grid = new Map<EmojiCategoryList, TGridCategory>();

  private constructor(library: EmojiLibrary = emojiMartData) {
    super(library);

    this.addFrequentCategory();
    this.initCategories(library.categories);
    this.initGrid();
  }

  public static getInstance(library: EmojiLibrary = emojiMartData) {
    if (!EmojiFlyoutLibrary.instance) {
      EmojiFlyoutLibrary.instance = new EmojiFlyoutLibrary(library);
    }

    return EmojiFlyoutLibrary.instance;
  }

  private addFrequentCategory() {
    this.categories.push('frequent');
    this.emojis.frequent = DEFAULT_FREQUENTLY_USED_EMOJI;
  }

  private initCategories(categoriesLibrary: any) {
    for (const category of categoriesLibrary) {
      this.categories.push(category.id);
      this.emojis[category.id] = category.emojis;
    }
  }

  private initGrid() {
    let rowsCount = 0;
    this.categories.forEach((categoryId) => {
      const rows = this.initRows(this.emojis[categoryId as any], rowsCount);
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

  getCategories() {
    return this.categories;
  }

  getEmojisInRows(categoryId: EmojiCategoryList) {
    return this.grid.get(categoryId)!;
  }
}
