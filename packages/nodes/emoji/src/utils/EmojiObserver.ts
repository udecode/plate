import { MutableRefObject } from 'react';
import { EmojiCategoryList } from '../types';
import { IEmojiFlyoutLibrary } from './EmojiLibrary';
import { MapEmojiCategoryType } from './EmojiPicker';

const setVisibleSections = (
  entries: IntersectionObserverEntry[],
  visibleSections: MapEmojiCategoryType
) => {
  for (const entry of entries) {
    const id = (entry.target as HTMLDivElement).dataset.id as EmojiCategoryList;
    visibleSections.set(id, entry.intersectionRatio);
  }
};

const getSectionInFocus = (
  visibleSections: MapEmojiCategoryType
): EmojiCategoryList | undefined => {
  for (const [id, ratio] of visibleSections) {
    if (ratio) {
      return id;
    }
  }
};

export type SetFocusedAndVisibleSectionsType = (
  visibleSections: MapEmojiCategoryType,
  categoryId?: EmojiCategoryList
) => void;

export type ObserverCategoriesType = {
  ancestorRef: MutableRefObject<HTMLDivElement | null>;
  emojiLibrary: IEmojiFlyoutLibrary;
  setFocusedAndVisibleSections: SetFocusedAndVisibleSectionsType;
};

export const observeCategories = ({
  ancestorRef,
  emojiLibrary,
  setFocusedAndVisibleSections,
}: ObserverCategoriesType) => {
  const observerOptions = {
    root: ancestorRef.current,
    threshold: [0.0, 1.0],
  };

  const visibleSections: MapEmojiCategoryType = new Map();

  const observer = new IntersectionObserver((entries) => {
    setVisibleSections(entries, visibleSections);
    const focusedSectionId = getSectionInFocus(visibleSections);

    setFocusedAndVisibleSections(visibleSections, focusedSectionId);
  }, observerOptions);

  for (const { root } of emojiLibrary.getGrid().values()) {
    if (root.current) observer.observe(root.current);
  }

  return observer;
};
