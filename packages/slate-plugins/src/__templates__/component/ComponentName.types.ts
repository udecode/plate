import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';

export interface ComponentNameProps {
  /**
   * Additional class name to provide on the root element, in addition to the slate-ComponentName class.
   */
  className?: string;

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ComponentNameStyleProps, ComponentNameStyles>;
}

export interface ComponentNameStyleProps {
  className?: string;
}

export interface ComponentNameStyles {
  root?: IStyle;
}
