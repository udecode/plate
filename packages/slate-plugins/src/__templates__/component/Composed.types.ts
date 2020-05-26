import { IStyleFunctionOrObject } from '@uifabric/utilities';
import {
  ComponentNameProps,
  ComponentNameStyleProps,
  ComponentNameStyles,
} from './ComponentName.types';

export interface ComposedProps extends ComponentNameProps {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ComposedStyleProps, ComposedStyles>;
}

export interface ComposedStyleProps extends ComponentNameStyleProps {}

export interface ComposedStyles extends ComponentNameStyles {}
