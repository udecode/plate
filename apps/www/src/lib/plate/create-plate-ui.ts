import { withProps } from '@udecode/cn';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
} from '@udecode/plate-code-block';
import { MARK_COMMENT } from '@udecode/plate-comments';
import {
  PlateElement,
  PlateLeaf,
  type PlatePluginComponent,
} from '@udecode/plate-common';
import { ELEMENT_EXCALIDRAW } from '@udecode/plate-excalidraw';
import { MARK_SEARCH_HIGHLIGHT } from '@udecode/plate-find-replace';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { MARK_HIGHLIGHT } from '@udecode/plate-highlight';
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { MARK_KBD } from '@udecode/plate-kbd';
import { ELEMENT_COLUMN, ELEMENT_COLUMN_GROUP } from '@udecode/plate-layout';
import { ELEMENT_LINK } from '@udecode/plate-link';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
} from '@udecode/plate-list';
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate-media';
import { ELEMENT_MENTION, ELEMENT_MENTION_INPUT } from '@udecode/plate-mention';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { ELEMENT_SLASH_INPUT } from '@udecode/plate-slash-command';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@udecode/plate-table';
import { ELEMENT_TOGGLE } from '@udecode/plate-toggle';

import { BlockquoteElement } from '@/registry/default/plate-ui/blockquote-element';
import { CodeBlockElement } from '@/registry/default/plate-ui/code-block-element';
import { CodeLeaf } from '@/registry/default/plate-ui/code-leaf';
import { CodeLineElement } from '@/registry/default/plate-ui/code-line-element';
import { CodeSyntaxLeaf } from '@/registry/default/plate-ui/code-syntax-leaf';
import { ColumnElement } from '@/registry/default/plate-ui/column-element';
import { ColumnGroupElement } from '@/registry/default/plate-ui/column-group-element';
import { CommentLeaf } from '@/registry/default/plate-ui/comment-leaf';
import { ExcalidrawElement } from '@/registry/default/plate-ui/excalidraw-element';
import { HeadingElement } from '@/registry/default/plate-ui/heading-element';
import { HighlightLeaf } from '@/registry/default/plate-ui/highlight-leaf';
import { HrElement } from '@/registry/default/plate-ui/hr-element';
import { ImageElement } from '@/registry/default/plate-ui/image-element';
import { KbdLeaf } from '@/registry/default/plate-ui/kbd-leaf';
import { LinkElement } from '@/registry/default/plate-ui/link-element';
import { ListElement } from '@/registry/default/plate-ui/list-element';
import { MediaEmbedElement } from '@/registry/default/plate-ui/media-embed-element';
import { MentionElement } from '@/registry/default/plate-ui/mention-element';
import { MentionInputElement } from '@/registry/default/plate-ui/mention-input-element';
import { ParagraphElement } from '@/registry/default/plate-ui/paragraph-element';
import { withPlaceholders } from '@/registry/default/plate-ui/placeholder';
import { SearchHighlightLeaf } from '@/registry/default/plate-ui/search-highlight-leaf';
import { SlashInputElement } from '@/registry/default/plate-ui/slash-input-element';
import {
  TableCellElement,
  TableCellHeaderElement,
} from '@/registry/default/plate-ui/table-cell-element';
import { TableElement } from '@/registry/default/plate-ui/table-element';
import { TableRowElement } from '@/registry/default/plate-ui/table-row-element';
import { TodoListElement } from '@/registry/default/plate-ui/todo-list-element';
import { ToggleElement } from '@/registry/default/plate-ui/toggle-element';
import { withDraggables } from '@/registry/default/plate-ui/with-draggables';

export const createPlateUI = (
  overrideByKey?: Partial<Record<string, PlatePluginComponent>>,
  {
    draggable,
    placeholder,
  }: { draggable?: boolean; placeholder?: boolean } = {}
) => {
  let components: Record<string, PlatePluginComponent> = {
    [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
    [ELEMENT_CODE_BLOCK]: CodeBlockElement,
    [ELEMENT_CODE_LINE]: CodeLineElement,
    [ELEMENT_CODE_SYNTAX]: CodeSyntaxLeaf,
    [ELEMENT_COLUMN]: ColumnElement,
    [ELEMENT_COLUMN_GROUP]: ColumnGroupElement,
    [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
    [ELEMENT_H1]: withProps(HeadingElement, { variant: 'h1' }),
    [ELEMENT_H2]: withProps(HeadingElement, { variant: 'h2' }),
    [ELEMENT_H3]: withProps(HeadingElement, { variant: 'h3' }),
    [ELEMENT_H4]: withProps(HeadingElement, { variant: 'h4' }),
    [ELEMENT_H5]: withProps(HeadingElement, { variant: 'h5' }),
    [ELEMENT_H6]: withProps(HeadingElement, { variant: 'h6' }),
    [ELEMENT_HR]: HrElement,
    [ELEMENT_IMAGE]: ImageElement,
    [ELEMENT_LI]: withProps(PlateElement, { as: 'li' }),
    [ELEMENT_LINK]: LinkElement,
    [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
    [ELEMENT_MENTION]: MentionElement,
    [ELEMENT_MENTION_INPUT]: MentionInputElement,
    [ELEMENT_OL]: withProps(ListElement, { variant: 'ol' }),
    [ELEMENT_PARAGRAPH]: ParagraphElement,
    [ELEMENT_SLASH_INPUT]: SlashInputElement,
    [ELEMENT_TABLE]: TableElement,
    [ELEMENT_TD]: TableCellElement,
    [ELEMENT_TH]: TableCellHeaderElement,
    [ELEMENT_TODO_LI]: TodoListElement,
    [ELEMENT_TOGGLE]: ToggleElement,
    [ELEMENT_TR]: TableRowElement,
    [ELEMENT_UL]: withProps(ListElement, { variant: 'ul' }),
    [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
    [MARK_CODE]: CodeLeaf,
    [MARK_COMMENT]: CommentLeaf,
    [MARK_HIGHLIGHT]: HighlightLeaf,
    [MARK_ITALIC]: withProps(PlateLeaf, { as: 'em' }),
    [MARK_KBD]: KbdLeaf,
    [MARK_SEARCH_HIGHLIGHT]: SearchHighlightLeaf,
    [MARK_STRIKETHROUGH]: withProps(PlateLeaf, { as: 's' }),
    [MARK_SUBSCRIPT]: withProps(PlateLeaf, { as: 'sub' }),
    [MARK_SUPERSCRIPT]: withProps(PlateLeaf, { as: 'sup' }),
    [MARK_UNDERLINE]: withProps(PlateLeaf, { as: 'u' }),
  };

  if (overrideByKey) {
    Object.keys(overrideByKey).forEach((key) => {
      (components as any)[key] = (overrideByKey as any)[key];
    });
  }
  if (placeholder) {
    components = withPlaceholders(components);
  }
  if (draggable) {
    components = withDraggables(components);
  }

  return components;
};
