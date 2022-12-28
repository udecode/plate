import { MutableRefObject } from 'react';
import { EmojiCategoryList } from '../types';
import { IEmojiFloatingLibrary } from './EmojiLibrary';
import { MapEmojiCategoryList } from './EmojiPicker';

const setVisibleSections = (
  entries: IntersectionObserverEntry[],
  visibleSections: MapEmojiCategoryList
) => {
  for (const entry of entries) {
    const id = (entry.target as HTMLDivElement).dataset.id as EmojiCategoryList;
    visibleSections.set(id, entry.isIntersecting);
  }
};

const getSectionInFocus = (
  visibleSections: MapEmojiCategoryList
): EmojiCategoryList | undefined => {
  for (const [id, ratio] of visibleSections) {
    if (ratio) {
      return id;
    }
  }
};

export type SetFocusedAndVisibleSectionsType = (
  visibleSections: MapEmojiCategoryList,
  categoryId?: EmojiCategoryList
) => void;

export type ObserverCategoriesType = {
  ancestorRef: MutableRefObject<HTMLDivElement | null>;
  emojiLibrary: IEmojiFloatingLibrary;
  setFocusedAndVisibleSections: SetFocusedAndVisibleSectionsType;
};

export const observeCategories = ({
  ancestorRef,
  emojiLibrary,
  setFocusedAndVisibleSections,
}: ObserverCategoriesType) => {
  const observerOptions = {
    root: ancestorRef.current,
    threshold: 0,
  };

  const visibleSections: MapEmojiCategoryList = new Map();

  const observer = new IntersectionObserver((entries) => {
    setVisibleSections(entries, visibleSections);
    const focusedSectionId = getSectionInFocus(visibleSections);

    setFocusedAndVisibleSections(visibleSections, focusedSectionId);
  }, observerOptions);

  for (const section of emojiLibrary.getGrid().sections()) {
    if (section.root.current) observer.observe(section.root.current);
  }

  return observer;
};
