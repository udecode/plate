import { RootClassName } from './RootClassName';
import { RootStyles } from './RootStyles';

export interface StyledProps<TStyles = {}> {
  /**
   * Customized styling that will layer on top of the default rules.
   */
  styles?: Partial<RootStyles> & Partial<TStyles>;

  /**
   * Class names for the root component and the subcomponents.
   */
  classNames?: RootClassName & Record<keyof TStyles, string>;

  prefixClassNames?: string;

  as?: string | Element;
}
