import { useCallback } from 'react';
import {
  AsProps,
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useElement,
} from '@udecode/plate-common';
import { TMediaElement } from '../types';
import { floatingMediaActions } from './floatingMediaStore';

export const useFloatingMediaEditButton = (
  props: HTMLPropsAs<'button'>
): HTMLPropsAs<'button'> => {
  const element = useElement<TMediaElement>();

  return {
    onClick: useCallback(() => {
      floatingMediaActions.url(element.url);
      floatingMediaActions.isEditing(true);
    }, [element.url]),
    ...props,
  };
};

export const FloatingMediaEditButton = createComponentAs<AsProps<'button'>>(
  (props) => {
    const htmlProps = useFloatingMediaEditButton(props);

    return createElementAs('button', htmlProps);
  }
);
