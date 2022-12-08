import { MutableRefObject } from 'react';
import { EmojiCategoryList } from '../types';
import { IEmojiFlyoutLibrary } from './EmojiLibrary';

const setVisibleSections = (
  entries: IntersectionObserverEntry[],
  visibleSections: Map<EmojiCategoryList, number>
) => {
  for (const entry of entries) {
    const id = (entry.target as HTMLDivElement).dataset.id as EmojiCategoryList;
    visibleSections.set(id, entry.intersectionRatio);
  }
};

const setSectionInFocus = (
  visibleSections: Map<EmojiCategoryList, number>,
  setFocusedSection: (id: EmojiCategoryList) => void
) => {
  for (const [id, ratio] of visibleSections) {
    if (ratio) {
      setFocusedSection(id);
      break;
    }
  }
};

export const observeCategories = (
  ref: MutableRefObject<HTMLDivElement | null>,
  emojiLibrary: IEmojiFlyoutLibrary,
  setFocusedSection: (id: EmojiCategoryList) => void
) => {
  const observerOptions = {
    root: ref.current,
    threshold: [0.0, 1.0],
  };

  const visibleSections = new Map<EmojiCategoryList, number>();

  const observer = new IntersectionObserver((entries) => {
    setVisibleSections(entries, visibleSections);
    setSectionInFocus(visibleSections, setFocusedSection);
  }, observerOptions);

  for (const { root } of emojiLibrary.getGrid().values()) {
    if (root.current) observer.observe(root.current);
  }

  return observer;
};
