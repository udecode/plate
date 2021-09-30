import { ReactNode } from 'react';
import { Modifier } from '@popperjs/core';
import * as PopperJS from '@popperjs/core';
import { TEditor } from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import { ToolbarProps } from '../Toolbar/Toolbar.types';

export interface BalloonToolbarStyleProps extends BalloonToolbarProps {
  hidden?: boolean;
}

export interface BalloonToolbarProps extends StyledProps<ToolbarProps> {
  children: ReactNode;

  /**
   * Below of above the selection.
   */
  direction?: UsePopupPositionProps['placement'];

  /**
   * Color theme for the background/foreground.
   */
  theme?: 'dark' | 'light';

  /**
   * Show an arrow pointing to up or down depending on the direction.
   */
  arrow?: boolean;

  portalElement?: Element;

  /**
   * Parent scroll container element of the editor,
   * if no scroll container provided, it will take document.documentElement as scrolling container
   */
  scrollContainer?: HTMLElement;
}

export interface UsePopupPositionProps {
  editor: TEditor;
  popupElem: HTMLElement | null;
  scrollContainer?: Document | HTMLElement | null;
  modifiers?: Array<Partial<Modifier<string, any>>>;
  placement?: PopperJS.Placement;
}

export type UsePopupPositionReturnType = [
  { [key: string]: React.CSSProperties },
  {
    [key: string]:
      | {
          [key: string]: string;
        }
      | undefined;
  },
  boolean
];

export interface UsePopupPosition {
  ({
    editor,
    popupElem,
    scrollContainer,
  }: UsePopupPositionProps): UsePopupPositionReturnType;
}
