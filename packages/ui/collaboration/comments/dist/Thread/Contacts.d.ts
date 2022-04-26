import '@material/list/dist/mdc.list.css';
import '@material/menu/dist/mdc.menu.css';
import React, { RefObject } from 'react';
import { MDCMenu } from '@material/menu';
import { Contact } from '@udecode/plate-comments';
interface ContactsProps {
    contacts: Contact[];
    onSelected: (contact: Contact) => void;
    onClosed: () => void;
    selectedIndex: number;
}
export declare class Contacts extends React.Component<ContactsProps> {
    contactsRef: RefObject<HTMLDivElement>;
    contactsMenu?: MDCMenu;
    constructor(props: ContactsProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    onMenuSelected(event: CustomEvent): void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=Contacts.d.ts.map