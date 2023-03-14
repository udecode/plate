import { ChangeEventHandler, useCallback } from 'react';
import {
  AsProps,
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  mergeProps,
} from '@udecode/plate-common';
import {
  floatingLinkActions,
  floatingLinkSelectors,
} from './floatingLinkStore';

export const useFloatingLinkTextInput = (
  props: HTMLPropsAs<'input'>
): HTMLPropsAs<'input'> => {
  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    floatingLinkActions.text(e.target.value);
  }, []);

  return mergeProps(
    {
      onChange,
      defaultValue: floatingLinkSelectors.text(),
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
