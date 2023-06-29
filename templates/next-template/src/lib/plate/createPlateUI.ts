import { PlatePluginComponent } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

import { ParagraphElement } from '@/components/plate-ui/paragraph-element';

export const createPlateUI = () => {
  let components: Record<string, PlatePluginComponent> = {
    // [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
    // [ELEMENT_CODE_BLOCK]: CodeBlockElement,
    // [ELEMENT_CODE_LINE]: CodeLineElement,
    // [ELEMENT_CODE_SYNTAX]: CodeSyntaxLeaf,
    // [ELEMENT_HR]: HrElement,
    // [ELEMENT_H1]: withProps(HeadingElement, { variant: 'h1' }),
    // [ELEMENT_H2]: withProps(HeadingElement, { variant: 'h2' }),
    // [ELEMENT_H3]: withProps(HeadingElement, { variant: 'h3' }),
    // [ELEMENT_H4]: withProps(HeadingElement, { variant: 'h4' }),
    // [ELEMENT_H5]: withProps(HeadingElement, { variant: 'h5' }),
    // [ELEMENT_H6]: withProps(HeadingElement, { variant: 'h6' }),
    // [ELEMENT_IMAGE]: ImageElement,
    // [ELEMENT_LI]: withProps(PlateElement, { as: 'li' }),
    // [ELEMENT_LINK]: LinkElement,
    // [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
    // [ELEMENT_MENTION]: MentionElement,
    // [ELEMENT_MENTION_INPUT]: MentionInputElement,
    // [ELEMENT_UL]: withProps(ListElement, { variant: 'ul' }),
    // [ELEMENT_OL]: withProps(ListElement, { variant: 'ol' }),
    [ELEMENT_PARAGRAPH]: ParagraphElement,
    // [ELEMENT_TABLE]: TableElement,
    // [ELEMENT_TD]: TableCellElement,
    // [ELEMENT_TH]: TableCellHeaderElement,
    // [ELEMENT_TODO_LI]: TodoListElement,
    // [ELEMENT_TR]: TableRowElement,
    // [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
    // [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
    // [MARK_CODE]: CodeLeaf,
    // [MARK_HIGHLIGHT]: HighlightLeaf,
    // [MARK_ITALIC]: withProps(PlateLeaf, { as: 'em' }),
    // [MARK_KBD]: KbdLeaf,
    // [MARK_SEARCH_HIGHLIGHT]: SearchHighlightLeaf,
    // [MARK_STRIKETHROUGH]: withProps(PlateLeaf, { as: 's' }),
    // [MARK_SUBSCRIPT]: withProps(PlateLeaf, { as: 'sub' }),
    // [MARK_SUPERSCRIPT]: withProps(PlateLeaf, { as: 'sup' }),
    // [MARK_UNDERLINE]: withProps(PlateLeaf, { as: 'u' }),
    // [MARK_COMMENT]: CommentLeaf,
  };

  // components = withPlaceholders(components);
  // components = withDraggables(components);

  return components;
};
