import '@material/list/dist/mdc.list.css';
import '@material/menu/dist/mdc.menu.css';
import React, { RefObject } from 'react';
import { Corner, DefaultFocusState, MDCMenu } from '@material/menu';
import { Contact } from '@xolvio/plate-comments';

interface ContactsProps {
  contacts: Contact[];
  onSelected: (contact: Contact) => void;
  onClosed: () => void;
  selectedIndex: number;
}

export class Contacts extends React.Component<ContactsProps> {
  contactsRef: RefObject<HTMLDivElement>;
  contactsMenu?: MDCMenu;

  constructor(props: ContactsProps) {
    super(props);

    this.contactsRef = React.createRef();

    this.onMenuSelected = this.onMenuSelected.bind(this);
  }

  componentDidMount() {
    this.contactsMenu = new MDCMenu(this.contactsRef.current!);
    this.contactsMenu.setDefaultFocusState(DefaultFocusState.NONE);
    this.contactsMenu.setAnchorCorner(Corner.BOTTOM_START);

    const { onClosed } = this.props;
    this.contactsMenu.listen('MDCMenu:selected', this.onMenuSelected);
    this.contactsMenu.listen('MDCMenuSurface:closed', onClosed);

    this.contactsMenu.open = true;
  }

  componentWillUnmount() {
    this.contactsMenu!.unlisten('MDCMenu:selected', this.onMenuSelected);
    const { onClosed } = this.props;
    this.contactsMenu!.unlisten('MDCMenuSurface:closed', onClosed);
    this.contactsMenu!.destroy();
  }

  onMenuSelected(event: CustomEvent) {
    const { contacts } = this.props;
    const selectedContactIndex = event.detail.index;
    const selectedContact = contacts[selectedContactIndex];
    const { onSelected } = this.props;
    onSelected(selectedContact);
  }

  render() {
    const { contacts, selectedIndex } = this.props;

    return (
      <div ref={this.contactsRef} className="mdc-menu mdc-menu-surface">
        <ul
          className="mdc-list mdc-menu__selection-group"
          role="menu"
          aria-hidden="true"
          aria-orientation="vertical"
          tabIndex={-1}
        >
          {contacts.map(({ id, name, email, avatarUrl }, index) => (
            <li
              key={id}
              className={`mdc-list-item mdc-list-item--with-two-lines mdc-list-item--with-leading-avatar${
                index === selectedIndex ? ' mdc-list-item--selected' : ''
              }`}
              tabIndex={index === selectedIndex ? 0 : -1}
            >
              <span className="mdc-list-item__ripple" />
              <span className="mdc-list-item__start">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  width={40}
                  height={40}
                  style={{ borderRadius: '50%' }}
                />
              </span>
              <span className="mdc-list-item__content">
                <span className="mdc-list-item__primary-text">{name}</span>
                <span className="mdc-list-item__secondary-text">{email}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
