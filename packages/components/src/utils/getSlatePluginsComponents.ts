import {
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_IMAGE,
  ELEMENT_LI,
  ELEMENT_LINK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_MENTION,
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
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_KBD,
  MARK_SEARCH_HIGHLIGHT,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
} from '@udecode/slate-plugins';
import { BlockquoteElement } from '../components/BlockquoteElement/BlockquoteElement';
import { CodeBlockElement } from '../components/CodeBlockElement/CodeBlockElement';
import { CodeLineElement } from '../components/CodeBlockElement/CodeLineElement';
import { ImageElement } from '../components/ImageElement/ImageElement';
import { LinkElement } from '../components/LinkElement/LinkElement';
import { MediaEmbedElement } from '../components/MediaEmbedElement/MediaEmbedElement';
import { MentionElement } from '../components/MentionElement/MentionElement';
import { StyledElement } from '../components/StyledElement/StyledElement';
import { StyledLeaf } from '../components/StyledLeaf/StyledLeaf';
import { TableElement } from '../components/TableElement/TableElement';
import { TodoListElement } from '../components/TodoListElement/TodoListElement';
import { getComponent } from './getComponent';

const baseMargin = 4.8;
const baseFontSize = 16;

export const getSlatePluginsComponents = () => {
  return {
    [ELEMENT_ALIGN_CENTER]: getComponent(StyledElement, {
      styles: {
        root: {
          textAlign: 'center',
        },
      },
    }),
    [ELEMENT_ALIGN_JUSTIFY]: getComponent(StyledElement, {
      styles: {
        root: {
          textAlign: 'justify',
        },
      },
    }),
    [ELEMENT_ALIGN_LEFT]: getComponent(StyledElement, {
      styles: {
        root: {
          textAlign: 'left',
        },
      },
    }),
    [ELEMENT_ALIGN_RIGHT]: getComponent(StyledElement, {
      styles: {
        root: {
          textAlign: 'right',
        },
      },
    }),
    [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
    [ELEMENT_CODE_BLOCK]: CodeBlockElement,
    [ELEMENT_CODE_LINE]: CodeLineElement,
    [ELEMENT_H1]: getComponent(StyledElement, {
      as: 'h1',
      styles: {
        root: {
          fontWeight: '400',
          marginTop: 0,
          marginBottom: `${baseMargin * 2.5}px`,
          fontSize: `${(baseFontSize * 20) / 11}px`,
          lineHeight: '36px',
          selectors: {
            ':not(:first-child)': { marginTop: '30px' },
          },
        },
      },
    }),
    [ELEMENT_H2]: getComponent(StyledElement, {
      as: 'h2',
      styles: {
        root: {
          fontWeight: '400',
          marginTop: 0,
          marginBottom: `${baseMargin * 1.5}px`,
          fontSize: `${(baseFontSize * 16) / 11}px`,
          lineHeight: '28px',
          selectors: {
            ':not(:first-child)': { marginTop: '18px' },
          },
        },
      },
    }),
    [ELEMENT_H3]: getComponent(StyledElement, {
      as: 'h3',
      styles: {
        root: {
          color: '#434343',
          fontWeight: '400',
          marginTop: 0,
          marginBottom: `${baseMargin * 1.25}px`,
          fontSize: `${(baseFontSize * 14) / 11}px`,
          selectors: {
            ':not(:first-child)': { marginTop: '8px' },
          },
        },
      },
    }),
    [ELEMENT_H4]: getComponent(StyledElement, {
      as: 'h4',
      styles: {
        root: {
          color: '#666666',
          fontWeight: '400',
          marginTop: 0,
          marginBottom: `${baseMargin}px`,
          fontSize: `${(baseFontSize * 12) / 11}px`,
          selectors: {
            ':not(:first-child)': { marginTop: '8px' },
          },
        },
      },
    }),
    [ELEMENT_H5]: getComponent(StyledElement, {
      as: 'h5',
      styles: {
        root: {
          color: '#666666',
          fontWeight: '400',
          marginTop: 0,
          marginBottom: `${baseMargin}px`,
          fontSize: `${baseFontSize}px`,
          selectors: {
            ':not(:first-child)': { marginTop: '8px' },
          },
        },
      },
    }),
    [ELEMENT_H6]: getComponent(StyledElement, {
      as: 'h6',
      styles: {
        root: {
          color: '#666666',
          fontWeight: '400',
          fontStyle: 'italic',
          marginTop: 0,
          marginBottom: `${baseMargin}px`,
          fontSize: `${baseFontSize}px`,
          selectors: {
            ':not(:first-child)': { marginTop: '8px' },
          },
        },
      },
    }),
    [ELEMENT_IMAGE]: ImageElement,
    [ELEMENT_LI]: getComponent(StyledElement, { as: 'li' }),
    [ELEMENT_LINK]: LinkElement,
    [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
    [ELEMENT_MENTION]: MentionElement,
    [ELEMENT_OL]: getComponent(StyledElement, { as: 'ol' }),
    [ELEMENT_PARAGRAPH]: getComponent(StyledElement, { as: 'p' }),
    [ELEMENT_TABLE]: TableElement,
    [ELEMENT_TD]: getComponent(StyledElement, {
      as: 'td',
      styles: {
        root: {
          backgroundColor: 'rgb(255, 255, 255)',
          border: '1px solid rgb(193, 199, 208)',
          padding: '8px',
          minWidth: '48px',
          selectors: {
            '> *': {
              margin: 0,
            },
          },
        },
      },
    }),
    [ELEMENT_TH]: getComponent(StyledElement, {
      as: 'th',
      styles: {
        root: {
          backgroundColor: 'rgb(244, 245, 247)',
          border: '1px solid rgb(193, 199, 208)',
          padding: '8px',
          minWidth: '48px',
          textAlign: 'left',
          selectors: {
            '> *': {
              margin: 0,
            },
          },
        },
      },
    }),
    [ELEMENT_TODO_LI]: TodoListElement,
    [ELEMENT_TR]: getComponent(StyledElement, { as: 'tr' }),
    [ELEMENT_UL]: getComponent(StyledElement, {
      as: 'ul',
      styles: {
        root: {
          paddingInlineStart: '24px',
          marginBlockStart: '0',
          marginBlockEnd: '0',
        },
      },
    }),
    [MARK_BOLD]: getComponent(StyledLeaf, { as: 'strong' }),
    [MARK_CODE]: getComponent(StyledLeaf, {
      as: 'code',
      styles: {
        root: {
          whiteSpace: 'pre-wrap',
          fontSize: '85%',
          fontFamily:
            '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;',
          backgroundColor: 'rgba(135,131,120,0.15)',
          borderRadius: '3px',
          padding: '0.2em 0.4em',
          lineHeight: 'normal',
        },
      },
    }),
    [MARK_HIGHLIGHT]: getComponent(StyledLeaf, {
      as: 'mark',
      styles: {
        root: {
          backgroundColor: '#FEF3B7',
        },
      },
    }),
    [MARK_ITALIC]: getComponent(StyledLeaf, { as: 'em' }),
    [MARK_KBD]: getComponent(StyledLeaf, {
      as: 'kbd',
      styles: {
        root: {
          whiteSpace: 'pre-wrap',
          fontSize: '75%',
          fontFamily:
            '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;',
          backgroundColor: 'white',
          border: '1px solid black',
          borderRadius: '3px',
          padding: '0.2em 0.4em',
          marginRight: '0.2em',
          lineHeight: 'normal',
          boxShadow: '2px 2px 3px 0px rgba(0,0,0,0.75)',
        },
      },
    }),
    [MARK_SEARCH_HIGHLIGHT]: getComponent(StyledLeaf, {
      as: 'span',
      styles: {
        root: {
          backgroundColor: '#fff59d',
        },
      },
    }),
    [MARK_STRIKETHROUGH]: getComponent(StyledLeaf, { as: 's' }),
    [MARK_SUBSCRIPT]: getComponent(StyledLeaf, { as: 'sub' }),
    [MARK_SUPERSCRIPT]: getComponent(StyledLeaf, { as: 'sup' }),
    [MARK_UNDERLINE]: getComponent(StyledLeaf, { as: 'u' }),
  };
};
