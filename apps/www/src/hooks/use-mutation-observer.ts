import * as React from 'react';

export const useMutationObserver = (
  ref: React.MutableRefObject<HTMLElement | null>,
  callback: MutationCallback,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  options = {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  }
) => {
  React.useEffect(() => {
    if (ref.current) {
      const observer = new MutationObserver(callback);
      observer.observe(ref.current, options);
      return () => observer.disconnect();
    }
  }, [ref, callback, options]);
};
