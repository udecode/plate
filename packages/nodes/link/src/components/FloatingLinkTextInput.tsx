import React, { ChangeEventHandler, useCallback } from 'react';
import {
  AsProps,
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  mergeProps,
} from '@udecode/plate-core';
import { floatingLinkStore } from './FloatingLink';

export const useFloatingLinkTextInput = (
  props: HTMLPropsAs<'input'>
): HTMLPropsAs<'input'> => {
  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    floatingLinkStore.set.text(e.target.value);
  }, []);

  return mergeProps(
    {
      onChange,
    },
    props
  );
};

export const FloatingLinkTextInput = createComponentAs<AsProps<'input'>>(
  (props) => {
    const htmlProps = useFloatingLinkTextInput(props);

    return createElementAs('input', htmlProps);
  }
);
