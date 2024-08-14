import React from 'react';

import { createPrimitiveComponent } from '@udecode/plate-common';

import { encodeUrlIfNeeded } from '../../utils/encodeUrlIfNeeded';
import { safeDecodeUrl } from '../../utils/safeDecodeUrl';
import {
  floatingLinkActions,
  floatingLinkSelectors,
  useFloatingLinkSelectors,
} from './floatingLinkStore';

export const useFloatingLinkUrlInputState = () => {
  const updated = useFloatingLinkSelectors().updated();
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current && updated) {
      setTimeout(() => {
        const input = ref.current;

        if (!input) return;

        input.focus();
        input.value = floatingLinkSelectors.url()
          ? safeDecodeUrl(floatingLinkSelectors.url())
          : '';
      }, 0);
    }
  }, [updated]);

  return {
    ref,
  };
};

export const useFloatingLinkUrlInput = (
  state: ReturnType<typeof useFloatingLinkUrlInputState>
) => {
  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback((e) => {
      const url = encodeUrlIfNeeded(e.target.value);
      floatingLinkActions.url(url);
    }, []);

  return {
    props: {
      defaultValue: floatingLinkSelectors.url(),
      onChange,
    },
    ref: state.ref,
  };
};

export const FloatingLinkUrlInput = createPrimitiveComponent('input')({
  propsHook: useFloatingLinkUrlInput,
  stateHook: useFloatingLinkUrlInputState,
});
