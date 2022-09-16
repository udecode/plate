import { useRef } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useOnClickOutside,
} from '@udecode/plate-core';

export type MoreMenuRootProps = {
  setMenuVisibility: (visibility: boolean) => void;
} & HTMLPropsAs<'div'>;

export const useMoreMenuRoot = (props: MoreMenuRootProps) => {
  const { setMenuVisibility } = props;

  const ref = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(
    () => {
      setMenuVisibility(false);
    },
    { refs: [ref] }
  );

  return { ...props, ref };
};

export const MoreMenuRoot = createComponentAs<MoreMenuRootProps>((props) => {
  const htmlProps = useMoreMenuRoot(props);
  return createElementAs('div', htmlProps);
});
