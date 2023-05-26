import {
  DefaultPlatePluginKey,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_HR,
  ELEMENT_IMAGE,
  ELEMENT_LI,
  ELEMENT_LINK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_MENTION,
  ELEMENT_MENTION_INPUT,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TODO_LI,
  ELEMENT_TR,
  ELEMENT_UL,
  MARK_BOLD,
  MARK_CODE,
  MARK_COMMENT,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_KBD,
  MARK_SEARCH_HIGHLIGHT,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  PlatePluginComponent,
  withProps,
} from '@udecode/plate';
import { PlateElement, PlateLeaf } from '@udecode/plate-tailwind';
import { BlockquoteElement } from './plate/block-quote/BlockquoteElement';
import { CodeBlockElement } from './plate/code-block/CodeBlockElement';
import { CodeLineElement } from './plate/code-block/CodeLineElement';
import { CodeSyntaxLeaf } from './plate/code-block/CodeSyntaxLeaf';
import { CommentLeaf } from './plate/comments/CommentLeaf';
import { HrElement } from './plate/horizontal-rule/HrElement';
import { LinkElement } from './plate/link/LinkElement';
import { TodoListElement } from './plate/list/TodoListElement';
import { ImageElement } from './plate/media/ImageElement';
import { MediaEmbedElement } from './plate/media/MediaEmbedElement';
import { MentionElement } from './plate/mention/MentionElement';
import { MentionInputElement } from './plate/mention/MentionInputElement';
import { PlateTableCellElement } from './plate/table/PlateTableCellElement';
import { PlateTableCellHeaderElement } from './plate/table/PlateTableCellHeaderElement';
import { PlateTableElement } from './plate/table/PlateTableElement';
import { PlateTableRowElement } from './plate/table/PlateTableRowElement';
import { CodeLeaf } from './codeLeaf';
import { HeadingElement } from './HeadingElement';
import { HighlightLeaf } from './highlightLeaf';
import { KbdLeaf } from './kbdLeaf';
import { ListElement } from './ListElement';
import { ParagraphElement } from './paragraphElement';
import { SearchHighlightLeaf } from './searchHighlightLeaf';

export const createPlateUI = <T extends string = string>(
  overrideByKey?: Partial<
    Record<DefaultPlatePluginKey | T, PlatePluginComponent>
  >
) => {
  const components = {
    [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
    [ELEMENT_CODE_BLOCK]: CodeBlockElement,
    [ELEMENT_CODE_LINE]: CodeLineElement,
    [ELEMENT_CODE_SYNTAX]: CodeSyntaxLeaf,
    [ELEMENT_HR]: HrElement,
    [ELEMENT_H1]: withProps(HeadingElement, { variant: 'h1' }),
    [ELEMENT_H2]: withProps(HeadingElement, { variant: 'h2' }),
    [ELEMENT_H3]: withProps(HeadingElement, { variant: 'h3' }),
    [ELEMENT_H4]: withProps(HeadingElement, { variant: 'h4' }),
    [ELEMENT_H5]: withProps(HeadingElement, { variant: 'h5' }),
    [ELEMENT_H6]: withProps(HeadingElement, { variant: 'h6' }),
    [ELEMENT_IMAGE]: ImageElement,
    [ELEMENT_LI]: withProps(PlateElement, { as: 'li' }),
    [ELEMENT_LINK]: LinkElement,
    [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
    [ELEMENT_MENTION]: MentionElement,
    [ELEMENT_MENTION_INPUT]: MentionInputElement,
    [ELEMENT_UL]: withProps(ListElement, { variant: 'ul' }),
    [ELEMENT_OL]: withProps(ListElement, { variant: 'ol' }),
    [ELEMENT_PARAGRAPH]: ParagraphElement,
    [ELEMENT_TABLE]: PlateTableElement,
    [ELEMENT_TD]: PlateTableCellElement,
    [ELEMENT_TH]: PlateTableCellHeaderElement,
    [ELEMENT_TODO_LI]: TodoListElement,
    [ELEMENT_TR]: PlateTableRowElement,
    [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
    [MARK_CODE]: CodeLeaf,
    [MARK_HIGHLIGHT]: HighlightLeaf,
    [MARK_ITALIC]: withProps(PlateLeaf, { as: 'em' }),
    [MARK_KBD]: KbdLeaf,
    [MARK_SEARCH_HIGHLIGHT]: SearchHighlightLeaf,
    [MARK_STRIKETHROUGH]: withProps(PlateLeaf, { as: 's' }),
    [MARK_SUBSCRIPT]: withProps(PlateLeaf, { as: 'sub' }),
    [MARK_SUPERSCRIPT]: withProps(PlateLeaf, { as: 'sup' }),
    [MARK_UNDERLINE]: withProps(PlateLeaf, { as: 'u' }),
    [MARK_COMMENT]: CommentLeaf,
  };

  if (overrideByKey) {
    Object.keys(overrideByKey).forEach((key) => {
      components[key] = overrideByKey[key];
    });
  }

  return components as Record<DefaultPlatePluginKey | T, PlatePluginComponent>;
};
