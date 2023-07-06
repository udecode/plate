import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPrimitiveComponent } from '@udecode/plate-common';

import {
  floatingLinkActions,
  floatingLinkSelectors,
  useFloatingLinkSelectors,
} from './floatingLinkStore';

export const useFloatingLinkNewTabInputState = () => {
  const updated = useFloatingLinkSelectors().updated();
  const ref = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState<boolean>(
    floatingLinkSelectors.newTab()
  );

  useEffect(() => {
    if (ref.current && updated) {
      setTimeout(() => {
        ref.current?.focus();
      }, 0);
    }
  }, [updated]);

  return {
    ref,
    checked,
    setChecked,
  };
};

export const useFloatingLinkNewTabInput = ({
  checked,
  ref,
  setChecked,
}: ReturnType<typeof useFloatingLinkNewTabInputState>) => {
  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setChecked(e.target.checked);
      floatingLinkActions.newTab(e.target.checked);
    },
    [setChecked]
  );

  return {
    ref,
    props: {
      onChange,
      checked,
      type: 'checkbox',
    },
  };
};

export const FloatingLinkNewTabInput = createPrimitiveComponent('input')({
  propsHook: useFloatingLinkNewTabInput,
  stateHook: useFloatingLinkNewTabInputState,
});
