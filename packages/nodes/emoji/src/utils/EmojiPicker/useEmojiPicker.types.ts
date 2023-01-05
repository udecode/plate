import { MutableRefObject, RefObject } from 'react';
import { PlateEditor, Value } from '@udecode/plate-core';
import {
  EmojiCategoryList,
  EmojiIconList,
  EmojiSettingsType,
  i18nProps,
} from '../../types';
import { Emoji, IEmojiFloatingLibrary } from '../EmojiLibrary';
import { AIndexSearch } from '../IndexSearch/IndexSearch';
import { MapEmojiCategoryList } from './EmojiPickerState.types';

export type MutableRefs = MutableRefObject<{
  contentRoot: RefObject<HTMLDivElement> | undefined;
  content: RefObject<HTMLDivElement> | undefined;
}>;

export type UseEmojiPickerProps = {
  closeOnSelect: boolean;
  editor: PlateEditor<Value>;
  emojiLibrary: IEmojiFloatingLibrary;
  indexSearch: AIndexSearch<Emoji>;
};

export type UseEmojiPickerType<T extends JSX.Element = JSX.Element> = {
  isOpen: boolean;
  onToggle: () => void;
  i18n: i18nProps;
  searchValue: string;
  setSearch: (value: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
  hasFound: boolean;
  searchResult: Emoji[];
  onMouseOver: (emoji?: Emoji) => void;
  onSelectEmoji: (emoji: Emoji) => void;
  emojiLibrary: IEmojiFloatingLibrary;
  icons: EmojiIconList<T>;
  handleCategoryClick: (id: EmojiCategoryList) => void;
  visibleCategories: MapEmojiCategoryList;
  refs: MutableRefs;
  settings: EmojiSettingsType;
  focusedCategory?: EmojiCategoryList;
  emoji?: Emoji;
  styles?: any;
};
