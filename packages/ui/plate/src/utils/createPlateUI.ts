import {
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
} from '@udecode/plate-headless';
import { StyledElement, StyledLeaf } from '@udecode/plate-styled-components';
import { BlockquoteElement } from '@udecode/plate-ui-block-quote';
import { CodeLineElement, CodeSyntaxLeaf } from '@udecode/plate-ui-code-block';
import { PlateCommentLeaf } from '@udecode/plate-ui-comments';
import { HrElement } from '@udecode/plate-ui-horizontal-rule';
import { LinkElement } from '@udecode/plate-ui-link';
import { TodoListElement } from '@udecode/plate-ui-list';
import { ImageElement, MediaEmbedElement } from '@udecode/plate-ui-media';
import { MentionElement, MentionInputElement } from '@udecode/plate-ui-mention';
import {
  PlateTableCellElement,
  PlateTableCellHeaderElement,
  PlateTableElement,
  PlateTableRowElement,
} from '@udecode/plate-ui-table';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { DefaultPlatePluginKey } from '../types/DefaultPlatePluginKey';

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
    [ELEMENT_H1]: withProps(StyledElement, {
      as: 'h1',
      styles: {
        root: css`
          margin: 2em 0 4px;
          font-size: 1.875em;
          font-weight: 500;
          line-height: 1.3;
        `,
      },
    }),
    [ELEMENT_H2]: withProps(StyledElement, {
      as: 'h2',
      styles: {
        root: css`
          margin: 1.4em 0 1px;
          font-size: 1.5em;
          font-weight: 500;
          line-height: 1.3;
        `,
      },
    }),
    [ELEMENT_H3]: withProps(StyledElement, {
      as: 'h3',
      styles: {
        root: css`
          margin: 1em 0 1px;
          font-size: 1.25em;
          font-weight: 500;
          line-height: 1.3;
          color: #434343;
        `,
      },
    }),
    [ELEMENT_H4]: withProps(StyledElement, {
      as: 'h4',
      styles: {
        root: css`
          margin: 0.75em 0 0;
          font-size: 1.1em;
          font-weight: 500;
          line-height: 1.3;
          color: #666666;
        `,
      },
    }),
    [ELEMENT_H5]: withProps(StyledElement, {
      as: 'h5',
      styles: {
        root: css`
          margin: 0.75em 0 0;
          font-size: 1.1em;
          font-weight: 500;
          line-height: 1.3;
          color: #666666;
        `,
      },
    }),
    [ELEMENT_H6]: withProps(StyledElement, {
      as: 'h6',
      styles: {
        root: css`
          margin: 0.75em 0 0;
          font-size: 1.1em;
          font-weight: 500;
          line-height: 1.3;
          color: #666666;
        `,
      },
    }),
    [ELEMENT_IMAGE]: ImageElement,
    [ELEMENT_LI]: withProps(StyledElement, { as: 'li' }),
    [ELEMENT_LINK]: LinkElement,
    [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
    [ELEMENT_MENTION]: MentionElement,
    [ELEMENT_MENTION_INPUT]: MentionInputElement,
    [ELEMENT_UL]: withProps(StyledElement, {
      as: 'ul',
      styles: {
        root: css`
          margin: 0;
          padding-inline-start: 24px;
        `,
      },
    }),
    [ELEMENT_OL]: withProps(StyledElement, {
      as: 'ol',
      styles: {
        root: css`
          margin: 0;
          padding-inline-start: 24px;
        `,
      },
    }),
    [ELEMENT_PARAGRAPH]: withProps(StyledElement, {
      as: 'p',
      styles: {
        root: tw`px-0 py-1 m-0`,
      },
      prefixClassNames: 'p',
    }),
    [ELEMENT_TABLE]: PlateTableElement,
    [ELEMENT_TD]: PlateTableCellElement,
    [ELEMENT_TH]: PlateTableCellHeaderElement,
    [ELEMENT_TODO_LI]: TodoListElement,
    [ELEMENT_TR]: PlateTableRowElement,
    [MARK_BOLD]: withProps(StyledLeaf, { as: 'strong' }),
    [MARK_CODE]: withProps(StyledLeaf, {
      as: 'code',
      styles: {
        root: [
          tw`whitespace-pre-wrap`,
          css`
            font-size: 85%;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
              Courier, monospace;
            background-color: rgba(135, 131, 120, 0.15);
            border-radius: 3px;
            padding: 0.2em 0.4em;
            line-height: normal;
          `,
        ],
      },
    }),
    [MARK_HIGHLIGHT]: withProps(StyledLeaf, {
      as: 'mark',
      styles: {
        root: tw`backgroundColor[#FEF3B7]`,
      },
    }),
    [MARK_ITALIC]: withProps(StyledLeaf, { as: 'em' }),
    [MARK_KBD]: withProps(StyledLeaf, {
      as: 'kbd',
      styles: {
        root: [
          tw`whitespace-pre-wrap`,
          css`
            font-size: 75%;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
              Courier, monospace;
            background-color: white;
            border: 1px solid black;
            border-radius: 3px;
            padding: 0.2em 0.4em;
            line-height: normal;
            margin-right: 0.2em;
            box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.75);
          `,
        ],
      },
    }),
    [MARK_SEARCH_HIGHLIGHT]: withProps(StyledLeaf, {
      as: 'span',
      styles: {
        root: tw`backgroundColor[#fff59d]`,
      },
    }),
    [MARK_STRIKETHROUGH]: withProps(StyledLeaf, { as: 's' }),
    [MARK_SUBSCRIPT]: withProps(StyledLeaf, { as: 'sub' }),
    [MARK_SUPERSCRIPT]: withProps(StyledLeaf, { as: 'sup' }),
    [MARK_UNDERLINE]: withProps(StyledLeaf, { as: 'u' }),
    [MARK_COMMENT]: PlateCommentLeaf,
  };

  if (overrideByKey) {
    Object.keys(overrideByKey).forEach((key) => {
      components[key] = overrideByKey[key];
    });
  }

  return components as Record<DefaultPlatePluginKey | T, PlatePluginComponent>;
};
