import React from 'react';
import {
  DefaultPlatePluginKey,
  ELEMENT_BLOCKQUOTE,
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
import {
  cn,
  PlateElement,
  PlateElementProps,
  PlateLeaf,
  PlateLeafProps,
} from '@udecode/plate-tailwind';
import { BlockquoteElement } from './plate/block-quote/BlockquoteElement';
import { CodeLineElement } from './plate/code-block/CodeLineElement';
import { CodeSyntaxLeaf } from './plate/code-block/CodeSyntaxLeaf';
import { PlateCommentLeaf } from './plate/comments/PlateCommentLeaf';
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

function H1Element(props: PlateElementProps) {
  return (
    <PlateElement
      as="h1"
      className={cn(
        'mx-0 mb-1 mt-[2em] text-[1.875em] font-medium leading-[1.3]'
      )}
      {...props}
    />
  );
}

function H2Element(props: PlateElementProps) {
  return (
    <PlateElement
      as="h2"
      className={cn(
        'mx-0 mb-px mt-[1.4em] text-[1.5em] font-medium leading-[1.3]'
      )}
      {...props}
    />
  );
}

function H3Element(props: PlateElementProps) {
  return (
    <PlateElement
      as="h3"
      className={cn(
        'mx-0 mb-px mt-[1em] text-[1.25em] font-medium leading-[1.3] text-[#434343]'
      )}
      {...props}
    />
  );
}

function H4Element(props: PlateElementProps) {
  return (
    <PlateElement
      as="h4"
      className={cn(
        'mx-0 mb-0 mt-[0.75em] text-[1.1em] font-medium leading-[1.3] text-[#666666]'
      )}
      {...props}
    />
  );
}

function H5Element(props: PlateElementProps) {
  return (
    <PlateElement
      as="h5"
      className={cn(
        'mx-0 mb-0 mt-[0.75em] text-[1.1em] font-medium leading-[1.3] text-[#666666]'
      )}
      {...props}
    />
  );
}

function H6Element(props: PlateElementProps) {
  return (
    <PlateElement
      as="h6"
      className={cn(
        'mx-0 mb-0 mt-[0.75em] text-[1.1em] font-medium leading-[1.3] text-[#666666]'
      )}
      {...props}
    />
  );
}

function UlElement(props: PlateElementProps) {
  return <PlateElement as="ul" className={cn('m-0 ps-6')} {...props} />;
}

function OlElement(props: PlateElementProps) {
  return <PlateElement as="ol" className={cn('m-0 ps-6')} {...props} />;
}

function ParagraphElement(props: PlateElementProps) {
  return <PlateElement as="p" className={cn('m-0 px-0 py-1')} {...props} />;
}

function CodeLeaf(props: PlateLeafProps) {
  return (
    <PlateLeaf
      as="code"
      className={cn(
        'whitespace-pre-wrap',
        "rounded-[3px] bg-[rgba(135,131,120,0.15)] px-[0.4em] py-[0.2em] font-['SFMono-Regular',_Consolas,_'Liberation_Mono',_Menlo,_Courier,_monospace] text-[85%] leading-[normal]"
      )}
      {...props}
    />
  );
}

function HighlightLeaf(props: PlateLeafProps) {
  return <PlateLeaf as="mark" className={cn('bg-[#FEF3B7]')} {...props} />;
}

function SearchHighlightLeaf(props: PlateLeafProps) {
  return <PlateLeaf className={cn('bg-[#fff59d]')} {...props} />;
}

function KbdLeaf(props: PlateLeafProps) {
  return (
    <PlateLeaf
      as="kbd"
      className={cn(
        'whitespace-pre-wrap border border-black bg-white',
        'mr-[0.2em] rounded-[3px] px-[0.4em] py-[0.2em] text-[75%] leading-[normal] shadow-[2px_2px_3px_0_rgba(0,_0,_0.75)]',
        "font-['SFMono-Regular',_Consolas,_'Liberation_Mono',_Menlo,_Courier,_monospace]"
      )}
      {...props}
    />
  );
}

export const createPlateUI = <T extends string = string>(
  overrideByKey?: Partial<
    Record<DefaultPlatePluginKey | T, PlatePluginComponent>
  >
) => {
  const components = {
    [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
    // [ELEMENT_CODE_BLOCK]: CodeBlockElement,
    [ELEMENT_CODE_LINE]: CodeLineElement,
    [ELEMENT_CODE_SYNTAX]: CodeSyntaxLeaf,
    [ELEMENT_HR]: HrElement,
    [ELEMENT_H1]: H1Element,
    [ELEMENT_H2]: H2Element,
    [ELEMENT_H3]: H3Element,
    [ELEMENT_H4]: H4Element,
    [ELEMENT_H5]: H5Element,
    [ELEMENT_H6]: H6Element,
    [ELEMENT_IMAGE]: ImageElement,
    [ELEMENT_LI]: withProps(PlateElement, { as: 'li' }),
    [ELEMENT_LINK]: LinkElement,
    [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
    [ELEMENT_MENTION]: MentionElement,
    [ELEMENT_MENTION_INPUT]: MentionInputElement,
    [ELEMENT_UL]: UlElement,
    [ELEMENT_OL]: OlElement,
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
    [MARK_COMMENT]: PlateCommentLeaf,
  };

  if (overrideByKey) {
    Object.keys(overrideByKey).forEach((key) => {
      components[key] = overrideByKey[key];
    });
  }

  return components as Record<DefaultPlatePluginKey | T, PlatePluginComponent>;
};
