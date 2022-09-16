import { useCallback } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type MoreMenuButtonProps = {
  setMenuVisibility: (visibility: boolean) => void;
} & HTMLPropsAs<'button'>;

export const useMoreMenuButton = (props: MoreMenuButtonProps) => {
  const { setMenuVisibility } = props;

  const onClick = useCallback(() => {
    setMenuVisibility(true);
  }, [setMenuVisibility]);

  return { ...props, onClick };
};

export const MoreMenuButton = createComponentAs<MoreMenuButtonProps>(
  (props) => {
    const htmlProps = useMoreMenuButton(props);
    return createElementAs('button', htmlProps);
  }
);
