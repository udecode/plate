import { ChangeEventHandler, useCallback, useRef } from 'react';
import {
  AsProps,
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  mergeProps,
  useComposedRef,
} from '@udecode/plate-core';
import {
  floatingLinkActions,
  floatingLinkSelectors,
} from './floatingLinkStore';

export const useFloatingLinkUrlInput = (
  props: HTMLPropsAs<'input'>
): HTMLPropsAs<'input'> => {
  const ref = useRef<HTMLInputElement>(null);

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    floatingLinkActions.url(e.target.value);
  }, []);

  return mergeProps(
    {
      onChange,
      defaultValue: floatingLinkSelectors.url(),
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
