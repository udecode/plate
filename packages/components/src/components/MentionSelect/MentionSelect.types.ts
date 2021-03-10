import { MentionNodeData } from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { NodeStyleProps } from '../../types';

export interface MentionSelectProps {
  /**
   * Additional class name to provide on the root element.
   */
  className?: string;

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<NodeStyleProps, MentionSelectStyleSet>;

  /**
   * Range from the mention trigger to the cursor
   */
  at: Range | null;

  /**
   * List of mentionable items
   */
  options: MentionNodeData[];

  /**
   * Index of the selected option
   */
  valueIndex: number;

  /**
   * Callback called when clicking on a mention option
   */
  onClickMention?: (editor: ReactEditor, option: MentionNodeData) => void;

  renderLabel?: (mentionable: MentionNodeData) => string;
}

export interface MentionSelectStyleSet {
  root?: IStyle;
  mentionItem?: IStyle;
  mentionItemSelected?: IStyle;
}
