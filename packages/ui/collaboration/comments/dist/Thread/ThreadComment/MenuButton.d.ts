import '@material/icon-button/dist/mdc.icon-button.css';
import '@material/list/dist/mdc.list.css';
import '@material/menu-surface/dist/mdc.menu-surface.css';
import '@material/menu/dist/mdc.menu.css';
import React from 'react';
import { MDCMenu } from '@material/menu';
import { StyledProps } from '@udecode/plate-styled-components';
export interface MenuButtonProps extends StyledProps {
    showLinkToThisComment: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onLinkToThisComment: () => void;
}
export declare class MenuButton extends React.Component<MenuButtonProps> {
    ref: React.RefObject<HTMLDivElement>;
    menu?: MDCMenu;
    button: any;
    constructor(props: MenuButtonProps);
    componentDidMount(): void;
    onClick(): void;
    render(): JSX.Element;
}
//# sourceMappingURL=MenuButton.d.ts.map