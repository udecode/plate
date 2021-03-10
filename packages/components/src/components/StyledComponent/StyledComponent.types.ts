import { NodeStyles } from '../../types';

export interface StyledComponentProps {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: NodeStyles;

  htmlAttributes?: { [key: string]: any };

  children?: any;

  as?: any;

  className?: string;
}
