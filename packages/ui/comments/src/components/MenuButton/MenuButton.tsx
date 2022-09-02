import '@material/icon-button/dist/mdc.icon-button.css';
import '@material/list/dist/mdc.list.css';
import '@material/menu-surface/dist/mdc.menu-surface.css';
import '@material/menu/dist/mdc.menu.css';
import React from 'react';
import { MoreVert } from '@styled-icons/material';
import { getMenuButtonStyles } from './MenuButton.styles';
import { MenuButtonProps } from './MenuButton.types';
import { useMenuButton } from './useMenuButton';

export const MenuButton = (props: MenuButtonProps) => {
  const {
    onClick,
    onDelete,
    onEdit,
    onLinkToThisComment,
    ref,
    showLinkToThisComment,
  } = useMenuButton(props);

  const styles = getMenuButtonStyles(props);

  return (
    <div className="mdc-menu-surface--anchor">
      <button
        type="button"
        css={styles.root.css}
        className={`${styles.root.className} mdc-icon-button`}
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
          <li className="mdc-list-item" role="menuitem" onClick={onEdit}>
            <span className="mdc-list-item__ripple" />
            <span className="mdc-list-item__text">Edit</span>
          </li>
          <li className="mdc-list-item" role="menuitem" onClick={onDelete}>
            <span className="mdc-list-item__ripple" />
            <span className="mdc-list-item__text">Delete</span>
          </li>
          <li
            className="mdc-list-item"
            role="menuitem"
            onClick={onLinkToThisComment}
            style={{ display: showLinkToThisComment ? 'block' : 'none' }}
          >
            <span className="mdc-list-item__ripple" />
            <span className="mdc-list-item__text">Link to this thread</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
