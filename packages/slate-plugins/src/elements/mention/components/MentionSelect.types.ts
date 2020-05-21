import { IStyle, IStyleFunctionOrObject } from '@uifabric/merge-styles';
import { MentionableItem } from 'elements/mention/types';
import { Range } from 'slate';

export interface MentionSelectProps {
  /**
   * Range from the mention trigger to the cursor
   */
  at: Range | null;
  /**
   * List of mentionable items
   */
  options: MentionableItem[];
  /**
   * Index of the selected option
   */
  valueIndex: number;
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<{}, MentionSelectStyles>;
}

export interface MentionSelectStyleProps {}

export interface MentionSelectStyles {
  root: IStyle;
  mentionItem: IStyle;
  mentionItemSelected: IStyle;
}
