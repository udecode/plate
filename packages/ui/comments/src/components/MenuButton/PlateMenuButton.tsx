import '@material/icon-button/dist/mdc.icon-button.css';
import '@material/list/dist/mdc.list.css';
import '@material/menu-surface/dist/mdc.menu-surface.css';
import '@material/menu/dist/mdc.menu.css';
import React, { useEffect, useRef } from 'react';
import { MDCMenu } from '@material/menu';
import { MoreVert } from '@styled-icons/material';
import { MenuButton } from './MenuButton';
import { menuButtonCss } from './styles';

export type MenuButtonProps = {
  showLinkToThisComment: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onLinkToThisComment: () => void;
};

let menu: MDCMenu;
export const PlateMenuButton = (props: MenuButtonProps) => {
  const { showLinkToThisComment } = props;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    menu = new MDCMenu(ref.current!);
  }, []);

  const onClick = () => {
    menu!.open = !menu!.open;
  };

  return (
    <div className="mdc-menu-surface--anchor">
      <button
        type="button"
        css={menuButtonCss}
        className="mdc-icon-button"
        onClick={onClick}
      >
        <div className="mdc-icon-button__ripple" />
        <MoreVert />
      </button>
      <div ref={ref} className="mdc-menu mdc-menu-surface">
        <ul
          className="mdc-list"
          role="menu"
          aria-hidden="true"
          aria-orientation="vertical"
          tabIndex={-1}
        >
          <MenuButton.EditItem
            {...props}
            className="mdc-list-item"
            role="menuitem"
          >
            <span className="mdc-list-item__ripple" />
            <span className="mdc-list-item__text">Edit</span>
          </MenuButton.EditItem>
          <MenuButton.DeleteItem
            {...props}
            className="mdc-list-item"
            role="menuitem"
          >
            <span className="mdc-list-item__ripple" />
            <span className="mdc-list-item__text">Delete</span>
          </MenuButton.DeleteItem>
          {showLinkToThisComment ? (
            <MenuButton.LinkItem
              {...props}
              className="mdc-list-item"
              role="menuitem"
            >
              <span className="mdc-list-item__ripple" />
              <span className="mdc-list-item__text">Link to this thread</span>
            </MenuButton.LinkItem>
          ) : null}
        </ul>
      </div>
    </div>
  );
};
