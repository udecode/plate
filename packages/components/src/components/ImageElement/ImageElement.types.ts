import { IStyle } from '@uifabric/styling';

export interface ImageElementStyleSet {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert ImageElement classNames below
  img?: IStyle;
}

export interface ImageElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert ImageElement style props below
  selected?: boolean;
  focused?: boolean;
}
