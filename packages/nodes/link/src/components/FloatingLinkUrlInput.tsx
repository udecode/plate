import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  AsProps,
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  mergeProps,
  useComposedRef,
} from '@udecode/plate-core';
import { floatingLinkStore } from './FloatingLink';

export const useFloatingLinkUrlInput = (
  props: HTMLPropsAs<'input'>
): HTMLPropsAs<'input'> => {
  const updated = floatingLinkStore.use.updated();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current && updated) {
      ref.current.focus();
    }
  }, [updated]);

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    floatingLinkStore.set.url(e.target.value);
  }, []);

  return mergeProps(
    {
      onChange,
    },
    { ...props, ref: useComposedRef<HTMLInputElement>(props.ref, ref) }
  );
};

export const FloatingLinkUrlInput = createComponentAs<AsProps<'input'>>(
  (props) => {
    const htmlProps = useFloatingLinkUrlInput(props);

    return createElementAs('input', htmlProps);
  }
);
