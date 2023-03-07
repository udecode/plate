import { ChangeEventHandler, useCallback, useEffect, useRef } from 'react';
import {
  AsProps,
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  mergeProps,
  useComposedRef,
} from '@udecode/plate-common';
import {
  floatingLinkActions,
  floatingLinkSelectors,
  useFloatingLinkSelectors,
} from './floatingLinkStore';

export const useFloatingLinkUrlInput = (
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
