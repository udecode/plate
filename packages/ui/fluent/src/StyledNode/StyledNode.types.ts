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
  TStyleSet = RootStyleSet
> = IStyleFunctionOrObject<TStyleProps, TStyleSet>;

export interface StyledProps<TStyleProps = ClassName, TStyleSet = RootStyleSet>
  extends ClassName {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: Styles<TStyleProps, TStyleSet>;

  as?: any;
}
