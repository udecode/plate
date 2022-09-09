import {
  AsProps,
  createComponentAs,
  HTMLPropsAs,
  mergeProps,
  useComposedRef,
} from '@udecode/plate-core';
import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  floatingLinkActions,
  floatingLinkSelectors,
  useFloatingLinkSelectors,
} from './floatingLinkStore';

export const useFloatingLinkNewTabInput = (
  props: HTMLPropsAs<'input'>
): HTMLPropsAs<'input'> => {
  const updated = useFloatingLinkSelectors().updated();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current && updated) {
      setTimeout(() => {
        ref.current?.focus();
      }, 0);
    }
  }, [updated]);

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    floatingLinkActions.newTab(e.target.checked);
  }, []);

  return mergeProps(
    {
      onChange,
      checked: floatingLinkSelectors.newTab(),
      type: 'checkbox',
    },
    { ...props, ref: useComposedRef<HTMLInputElement>(props.ref, ref) }
  );
};

export const FloatingLinkNewTabInput = createComponentAs<AsProps<'input'>>(
  (props) => {
    const htmlProps = useFloatingLinkNewTabInput(props);
    const [value, setValue] = useState<boolean>(htmlProps.checked as boolean);

    return (
      <input
        type={'checkbox'}
        checked={value}
        onChange={(e) => {
          setValue(e.target.checked);
          htmlProps.onChange?.(e);
        }}
      ></input>
    );
  }
);
