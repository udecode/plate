import { MutableRefObject, RefObject } from 'react';
import { PlateEditor, Value } from '@udecode/plate-core';
import {
  EmojiCategoryList,
  EmojiSettingsType,
  i18nProps,
  IconList,
} from '../../types';
import { Emoji, IEmojiFloatingLibrary } from '../EmojiLibrary';
import { AIndexSearch } from '../IndexSearch/IndexSearch';
import { MapEmojiCategoryType } from './EmojiPickerState.types';

export type MutableRefs = MutableRefObject<{
  contentRoot: RefObject<HTMLDivElement> | undefined;
  content: RefObject<HTMLDivElement> | undefined;
}>;

export type UseEmojiPickerProps = {
  isOpen: boolean;
  editor: PlateEditor<Value>;
  emojiLibrary: IEmojiFloatingLibrary;
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
  emojiLibrary: IEmojiFloatingLibrary;
  icons: IconList<T>;
  handleCategoryClick: (id: EmojiCategoryList) => void;
  visibleCategories: MapEmojiCategoryType;
  refs: MutableRefs;
  settings: EmojiSettingsType;
  focusedCategory?: EmojiCategoryList;
  emoji?: Emoji;
  styles?: any;
};
