import { FunctionComponent } from 'react';
import {
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
} from '@udecode/slate-plugins-alignment';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
} from '@udecode/slate-plugins-basic-marks';
import { ELEMENT_BLOCKQUOTE } from '@udecode/slate-plugins-block-quote';
import { BlockquoteElement } from '@udecode/slate-plugins-block-quote-ui';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@udecode/slate-plugins-code-block';
import {
  CodeBlockElement,
  CodeLineElement,
} from '@udecode/slate-plugins-code-block-ui';
import { withProps } from '@udecode/slate-plugins-common';
import { MARK_SEARCH_HIGHLIGHT } from '@udecode/slate-plugins-find-replace';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/slate-plugins-heading';
import { MARK_HIGHLIGHT } from '@udecode/slate-plugins-highlight';
import { ELEMENT_IMAGE } from '@udecode/slate-plugins-image';
import { ImageElement } from '@udecode/slate-plugins-image-ui';
import { MARK_KBD } from '@udecode/slate-plugins-kbd';
import { ELEMENT_LINK } from '@udecode/slate-plugins-link';
import { LinkElement } from '@udecode/slate-plugins-link-ui';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
} from '@udecode/slate-plugins-list';
import { TodoListElement } from '@udecode/slate-plugins-list-ui';
import { ELEMENT_MEDIA_EMBED } from '@udecode/slate-plugins-media-embed';
import { MediaEmbedElement } from '@udecode/slate-plugins-media-embed-ui';
import { ELEMENT_MENTION } from '@udecode/slate-plugins-mention';
import { MentionElement } from '@udecode/slate-plugins-mention-ui';
import { ELEMENT_PARAGRAPH } from '@udecode/slate-plugins-paragraph';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@udecode/slate-plugins-table';
import { TableElement } from '@udecode/slate-plugins-table-ui';
import { StyledElement, StyledLeaf } from '@udecode/slate-plugins-ui-fluent';
import { SlatePluginKey } from './createSlatePluginsOptions';

export const createSlatePluginsComponents = <T extends string = string>(
  overrides?: Partial<Record<SlatePluginKey | T, FunctionComponent<any>>>
) => {
  const components = {
    [ELEMENT_ALIGN_CENTER]: withProps(StyledElement, {
      styles: {
        root: {
          textAlign: 'center',
        },
      },
    }),
    [ELEMENT_ALIGN_JUSTIFY]: withProps(StyledElement, {
      styles: {
        root: {
          textAlign: 'justify',
        },
      },
    }),
    [ELEMENT_ALIGN_LEFT]: withProps(StyledElement, {
      styles: {
        root: {
          textAlign: 'left',
        },
      },
    }),
    [ELEMENT_ALIGN_RIGHT]: withProps(StyledElement, {
      styles: {
        root: {
          textAlign: 'right',
        },
      },
    }),
    [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
    [ELEMENT_CODE_BLOCK]: CodeBlockElement,
    [ELEMENT_CODE_LINE]: CodeLineElement,
    [ELEMENT_H1]: withProps(StyledElement, {
      as: 'h1',
      styles: {
        root: {
          margin: '2em 0 4px',
          fontSize: '1.875em',
          fontWeight: '500',
          lineHeight: '1.3',
        },
      },
    }),
    [ELEMENT_H2]: withProps(StyledElement, {
      as: 'h2',
      styles: {
        root: {
          margin: '1.4em 0 1px',
          fontSize: '1.5em',
          fontWeight: '500',
          lineHeight: '1.3',
        },
      },
    }),
    [ELEMENT_H3]: withProps(StyledElement, {
      as: 'h3',
      styles: {
        root: {
          margin: '1em 0 1px',
          color: '#434343',
          fontSize: '1.25em',
          fontWeight: '500',
          lineHeight: '1.3',
        },
      },
    }),
    [ELEMENT_H4]: withProps(StyledElement, {
      as: 'h4',
      styles: {
        root: {
          margin: '0.75em 0 0',
          color: '#666666',
          fontSize: '1.1em',
          fontWeight: '500',
          lineHeight: '1.3',
        },
      },
    }),
    [ELEMENT_H5]: withProps(StyledElement, {
      as: 'h5',
      styles: {
        root: {
          margin: '0.75em 0 0',
          color: '#666666',
          fontSize: '1.1em',
          fontWeight: '500',
          lineHeight: '1.3',
        },
      },
    }),
    [ELEMENT_H6]: withProps(StyledElement, {
      as: 'h6',
      styles: {
        root: {
          margin: '0.75em 0 0',
          color: '#666666',
          fontSize: '1.1em',
          fontWeight: '500',
          lineHeight: '1.3',
        },
      },
    }),
    [ELEMENT_IMAGE]: ImageElement,
    [ELEMENT_LI]: withProps(StyledElement, { as: 'li' }),
    [ELEMENT_LINK]: LinkElement,
    [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
    [ELEMENT_MENTION]: MentionElement,
    [ELEMENT_UL]: withProps(StyledElement, {
      as: 'ul',
      styles: {
        root: {
          margin: 0,
          paddingInlineStart: '24px',
        },
      },
    }),
    [ELEMENT_OL]: withProps(StyledElement, {
      as: 'ol',
      styles: {
        root: {
          margin: 0,
          paddingInlineStart: '24px',
        },
      },
    }),
    [ELEMENT_PARAGRAPH]: withProps(StyledElement, {
      as: 'p',
      styles: {
        root: {
          margin: 0,
          padding: '4px 0',
        },
      },
    }),
    [ELEMENT_TABLE]: TableElement,
    [ELEMENT_TD]: withProps(StyledElement, {
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
    [ELEMENT_TH]: withProps(StyledElement, {
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
    [ELEMENT_TR]: withProps(StyledElement, { as: 'tr' }),
    [MARK_BOLD]: withProps(StyledLeaf, { as: 'strong' }),
    [MARK_CODE]: withProps(StyledLeaf, {
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
    [MARK_HIGHLIGHT]: withProps(StyledLeaf, {
      as: 'mark',
      styles: {
        root: {
          backgroundColor: '#FEF3B7',
        },
      },
    }),
    [MARK_ITALIC]: withProps(StyledLeaf, { as: 'em' }),
    [MARK_KBD]: withProps(StyledLeaf, {
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
    [MARK_SEARCH_HIGHLIGHT]: withProps(StyledLeaf, {
      as: 'span',
      styles: {
        root: {
          backgroundColor: '#fff59d',
        },
      },
    }),
    [MARK_STRIKETHROUGH]: withProps(StyledLeaf, { as: 's' }),
    [MARK_SUBSCRIPT]: withProps(StyledLeaf, { as: 'sub' }),
    [MARK_SUPERSCRIPT]: withProps(StyledLeaf, { as: 'sup' }),
    [MARK_UNDERLINE]: withProps(StyledLeaf, { as: 'u' }),
  };

  if (overrides) {
    Object.keys(overrides).forEach((key) => {
      components[key] = overrides[key];
    });
  }

  return components as Record<SlatePluginKey | T, FunctionComponent>;
};
