import { MutableRefObject } from 'react';

export const observeCategories = (
  ref: MutableRefObject<HTMLElement | null>
) => {
  const observerOptions = {
    root: ref.current,
    threshold: [0.0, 1.0],
  };

  const observer = new IntersectionObserver((entries) => {
    // eslint-disable-next-line no-console
    console.log('entries', entries);
  }, observerOptions);

  // for (const { root } of this.refs.categories.values()) {
  //   observer.observe(root.current);
  // }

  return observer;
};
