import { useCallback } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { moreMenuActions, moreMenuSelectors } from './moreMenuStore';

export type MoreMenuButtonProps = HTMLPropsAs<'button'>;

export const useMoreMenuButton = (props: MoreMenuButtonProps) => {
  const onClick = useCallback(() => {
    const isMenuOpen = moreMenuSelectors.isMenuOpen();
    moreMenuActions.isMenuOpen(!isMenuOpen);
  }, []);

  return { ...props, onClick };
};

export const MoreMenuButton = createComponentAs<MoreMenuButtonProps>(
  (props) => {
    const htmlProps = useMoreMenuButton(props);
    return createElementAs('button', htmlProps);
  }
);
