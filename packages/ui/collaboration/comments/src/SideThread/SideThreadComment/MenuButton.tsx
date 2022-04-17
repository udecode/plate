import '@material/icon-button/dist/mdc.icon-button.css';
import '@material/list/dist/mdc.list.css';
import '@material/menu-surface/dist/mdc.menu-surface.css';
import '@material/menu/dist/mdc.menu.css';
import React from 'react';
import { MDCMenu } from '@material/menu';
// eslint-disable-next-line no-restricted-imports
import { MoreVert } from '@styled-icons/material/MoreVert';
import { StyledProps } from '@udecode/plate-styled-components';
import { createMoreButtonStyles } from './MenuButton.styles';

export interface MenuButtonProps extends StyledProps {
  showLinkToThisComment: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onLinkToThisComment: () => void;
}

export class MenuButton extends React.Component<MenuButtonProps> {
  ref: React.RefObject<HTMLDivElement>;
  menu?: MDCMenu;
  button: any;

  constructor(props: MenuButtonProps) {
    super(props);
    this.ref = React.createRef();
    this.onClick = this.onClick.bind(this);
    const { root: button } = createMoreButtonStyles(props);
    this.button = button;
  }

  componentDidMount() {
    this.menu = new MDCMenu(this.ref.current!);
  }

  onClick() {
    this.menu!.open = !this.menu!.open;
  }

  render() {
    const {
      showLinkToThisComment,
      onEdit,
      onDelete,
      onLinkToThisComment,
    } = this.props;

    return (
      <div className="mdc-menu-surface--anchor">
        <button
          type="button"
          css={this.button.css}
          className={`${this.button.className} mdc-icon-button`}
          onClick={this.onClick}
        >
          <div className="mdc-icon-button__ripple" />
          <MoreVert />
        </button>
        <div ref={this.ref} className="mdc-menu mdc-menu-surface">
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
  }
}
