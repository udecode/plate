import { useEffect, useRef } from 'react';
import { MDCMenu } from '@material/menu';
import { MenuButtonProps } from './MenuButton.types';

let menu: MDCMenu;

export const useMenuButton = (props: MenuButtonProps) => {
  const {
    showLinkToThisComment,
    onEdit,
    onDelete,
    onLinkToThisComment,
  } = props;

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    menu = new MDCMenu(ref.current!);
  }, []);

  const onClick = () => {
    menu!.open = menu!.open;
  };

  return {
    onClick,
    onDelete,
    onEdit,
    onLinkToThisComment,
    ref,
    showLinkToThisComment,
  } as const;
};
