import {
  ComponentNameStyleProps,
  ComponentNameStyles,
} from '__templates__/component/ComponentName.types';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';

export interface ToolbarProps {
  /**
   * Additional class name to provide on the root element, in addition to the slate-ComponentName class.
   */
  className?: string;

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */

  styles?: IStyleFunctionOrObject<ComponentNameStyleProps, ComponentNameStyles>;

  children?: any;
}

export interface ToolbarStyleProps {
  className?: string;
}

export interface ToolbarStyles {
  root: IStyle;
}
