import { ChangeEventHandler, useCallback, useEffect, useRef } from 'react';
import { createPrimitiveComponent } from '@udecode/plate-common';
import {
  floatingLinkActions,
  floatingLinkSelectors,
  useFloatingLinkSelectors,
} from './floatingLinkStore';

export const useFloatingLinkUrlInputState = () => {
  const updated = useFloatingLinkSelectors().updated();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current && updated) {
      setTimeout(() => {
        ref.current?.focus();
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
  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    floatingLinkActions.url(e.target.value);
  }, []);

  return {
    ref: state.ref,
    props: {
      onChange,
      defaultValue: floatingLinkSelectors.url(),
    },
  };
};

export const FloatingLinkUrlInput = createPrimitiveComponent('input')({
  propsHook: useFloatingLinkUrlInput,
  stateHook: useFloatingLinkUrlInputState,
});
