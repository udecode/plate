import { IStyle, IStyleFunctionOrObject } from '@uifabric/merge-styles';
import { MentionNodeData } from 'elements/mention/types';
import { Range } from 'slate';
import { ReactEditor } from 'slate-react';

export interface MentionSelectProps {
  /**
   * Range from the mention trigger to the cursor
   */
  at: Range | null;
  /**
   * Called when clicking on a mention option
   */
  onClickMention: (editor: ReactEditor, option: MentionNodeData) => void;
  /**
   * List of mentionable items
   */
  options: MentionNodeData[];
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
