import { MutableRefObject } from 'react';
import { PlateEditor, Value } from '@udecode/plate-core';
import { EmojiCategoryList, i18nProps, IconList } from '../../types';
import { Emoji, IEmojiFlyoutLibrary } from '../EmojiLibrary';
import { AIndexSearch } from '../IndexSearch/IndexSearch';
import { MapEmojiCategoryType } from './EmojiPickerState.types';

export type UseEmojiPickerProps = {
  isOpen: boolean;
  editor: PlateEditor<Value>;
  emojiLibrary: IEmojiFlyoutLibrary;
  indexSearch: AIndexSearch<Emoji>;
};

export type UseEmojiPickerType<T extends JSX.Element = JSX.Element> = {
  i18n: i18nProps;
  searchValue: string;
  setSearch: (value: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
  hasFound: boolean;
  searchResult: Emoji[];
  setEmoji: (emoji?: Emoji) => void;
  selectEmoji: (emoji: Emoji) => void;
  emojiLibrary: IEmojiFlyoutLibrary;
  icons: IconList<T>;
  handleCategoryClick: (id: EmojiCategoryList) => void;
  visibleCategories: MapEmojiCategoryType;
  scrollRef: MutableRefObject<HTMLDivElement | null>;
  focusedCategory?: EmojiCategoryList;
  emoji?: Emoji;
};
