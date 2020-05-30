import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { MentionNodeData } from '../types';

export interface MentionSelectProps {
  /**
   * Additional class name to provide on the root element, in addition to the slate-MentionSelect class.
   */
  className?: string;

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<MentionSelectStyleProps, MentionSelectStyles>;

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
}

export interface MentionSelectStyleProps {
  className?: string;
}

export interface MentionSelectStyles {
  root?: IStyle;
  mentionItem?: IStyle;
  mentionItemSelected?: IStyle;
}
