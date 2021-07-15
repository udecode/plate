import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';

export interface ClassName {
  /**
   * Additional class name to provide on the root element.
   */
  className?: string;
}

// Root style set
export interface RootStyleSet {
  /**
   * Style for the root element.
   */
  root?: IStyle;
}

export type Styles<
  TStyleProps = ClassName,
  TStyles = RootStyleSet
> = IStyleFunctionOrObject<TStyleProps, TStyles>;

export interface StyledProps<TStyleProps = ClassName, TStyles = RootStyleSet>
  extends ClassName {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: Styles<TStyleProps, TStyles>;

  as?: any;
}
