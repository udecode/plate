import { useRef } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useOnClickOutside,
} from '@udecode/plate-core';
import { moreMenuActions } from './moreMenuStore';

export type MoreMenuRootProps = HTMLPropsAs<'div'>;

export const useMoreMenuRoot = (props: MoreMenuRootProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(
    () => {
      moreMenuActions.isMenuOpen(false);
    },
    { refs: [ref] }
  );

  return { ...props, ref };
};

export const MoreMenuRoot = createComponentAs<MoreMenuRootProps>((props) => {
  const htmlProps = useMoreMenuRoot(props);
  return createElementAs('div', htmlProps);
});
