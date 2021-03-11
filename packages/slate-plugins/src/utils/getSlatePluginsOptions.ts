import {
  SlatePluginOptions,
  SlatePluginsOptions,
} from '@udecode/slate-plugins-core';
import {
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
} from '../elements/align/defaults';
import {
  DEFAULTS_BLOCKQUOTE,
  ELEMENT_BLOCKQUOTE,
} from '../elements/blockquote/defaults';
import {
  DEFAULTS_CODE_BLOCK,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '../elements/code-block/defaults';
import {
  DEFAULTS_H1,
  DEFAULTS_H2,
  DEFAULTS_H3,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '../elements/heading/defaults';
import { ELEMENT_IMAGE } from '../elements/image/defaults';
import { ELEMENT_LINK } from '../elements/link/defaults';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '../elements/list/defaults';
import { ELEMENT_MEDIA_EMBED } from '../elements/media-embed/defaults';
import { ELEMENT_MENTION } from '../elements/mention/defaults';
import {
  DEFAULTS_PARAGRAPH,
  ELEMENT_PARAGRAPH,
} from '../elements/paragraph/defaults';
import {
  DEFAULTS_TD,
  DEFAULTS_TH,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '../elements/table/defaults';
import {
  DEFAULTS_TODO_LIST,
  ELEMENT_TODO_LI,
} from '../elements/todo-list/defaults';
import { DEFAULTS_BOLD, MARK_BOLD } from '../marks/bold/defaults';
import { DEFAULTS_CODE, MARK_CODE } from '../marks/code/defaults';
import {
  DEFAULTS_HIGHLIGHT,
  MARK_HIGHLIGHT,
} from '../marks/highlight/defaults';
import { DEFAULTS_ITALIC, MARK_ITALIC } from '../marks/italic/defaults';
import { MARK_KBD } from '../marks/kbd/defaults';
import {
  DEFAULTS_STRIKETHROUGH,
  MARK_STRIKETHROUGH,
} from '../marks/strikethrough/defaults';
import {
  DEFAULTS_SUBSCRIPT,
  DEFAULTS_SUPERSCRIPT,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
} from '../marks/subsupscript/defaults';
import {
  DEFAULTS_UNDERLINE,
  MARK_UNDERLINE,
} from '../marks/underline/defaults';
import { MARK_SEARCH_HIGHLIGHT } from '../widgets/search-highlight/defaults';

type PluginKey =
  | typeof ELEMENT_ALIGN_CENTER
  | typeof ELEMENT_ALIGN_JUSTIFY
  | typeof ELEMENT_ALIGN_LEFT
  | typeof ELEMENT_ALIGN_RIGHT
  | typeof ELEMENT_BLOCKQUOTE
  | typeof ELEMENT_CODE_BLOCK
  | typeof ELEMENT_CODE_LINE
  | typeof ELEMENT_H1
  | typeof ELEMENT_H2
  | typeof ELEMENT_H3
  | typeof ELEMENT_H4
  | typeof ELEMENT_H5
  | typeof ELEMENT_H6
  | typeof ELEMENT_IMAGE
  | typeof ELEMENT_LI
  | typeof ELEMENT_LINK
  | typeof ELEMENT_MEDIA_EMBED
  | typeof ELEMENT_MENTION
  | typeof ELEMENT_OL
  | typeof ELEMENT_PARAGRAPH
  | typeof ELEMENT_TABLE
  | typeof ELEMENT_TD
  | typeof ELEMENT_TH
  | typeof ELEMENT_TODO_LI
  | typeof ELEMENT_TR
  | typeof ELEMENT_UL
  | typeof MARK_BOLD
  | typeof MARK_CODE
  | typeof MARK_HIGHLIGHT
  | typeof MARK_ITALIC
  | typeof MARK_KBD
  | typeof MARK_SEARCH_HIGHLIGHT
  | typeof MARK_STRIKETHROUGH
  | typeof MARK_SUBSCRIPT
  | typeof MARK_SUPERSCRIPT
  | typeof MARK_UNDERLINE;

export const getSlatePluginsOptions = (): Record<
  PluginKey,
  SlatePluginOptions
> => {
  const options: Record<PluginKey, Partial<SlatePluginOptions>> = {
    [ELEMENT_ALIGN_CENTER]: {},
    [ELEMENT_ALIGN_JUSTIFY]: {},
    [ELEMENT_ALIGN_LEFT]: {},
    [ELEMENT_ALIGN_RIGHT]: {},
    [ELEMENT_BLOCKQUOTE]: DEFAULTS_BLOCKQUOTE,
    [ELEMENT_CODE_BLOCK]: DEFAULTS_CODE_BLOCK,
    [ELEMENT_CODE_LINE]: {},
    [ELEMENT_H1]: DEFAULTS_H1,
    [ELEMENT_H2]: DEFAULTS_H2,
    [ELEMENT_H3]: DEFAULTS_H3,
    [ELEMENT_H4]: {},
    [ELEMENT_H5]: {},
    [ELEMENT_H6]: {},
    [ELEMENT_IMAGE]: {},
    [ELEMENT_LI]: {},
    [ELEMENT_LINK]: {},
    [ELEMENT_MEDIA_EMBED]: {},
    [ELEMENT_MENTION]: {},
    [ELEMENT_OL]: {},
    [ELEMENT_PARAGRAPH]: DEFAULTS_PARAGRAPH,
    [ELEMENT_TABLE]: {},
    [ELEMENT_TD]: DEFAULTS_TD,
    [ELEMENT_TH]: DEFAULTS_TH,
    [ELEMENT_TODO_LI]: DEFAULTS_TODO_LIST,
    [ELEMENT_TR]: {},
    [ELEMENT_UL]: {},
    [MARK_BOLD]: DEFAULTS_BOLD,
    [MARK_CODE]: DEFAULTS_CODE,
    [MARK_HIGHLIGHT]: DEFAULTS_HIGHLIGHT,
    [MARK_ITALIC]: DEFAULTS_ITALIC,
    [MARK_KBD]: {},
    [MARK_SEARCH_HIGHLIGHT]: {},
    [MARK_STRIKETHROUGH]: DEFAULTS_STRIKETHROUGH,
    [MARK_SUBSCRIPT]: DEFAULTS_SUBSCRIPT,
    [MARK_SUPERSCRIPT]: DEFAULTS_SUPERSCRIPT,
    [MARK_UNDERLINE]: DEFAULTS_UNDERLINE,
  };

  Object.keys(options).forEach((key) => {
    options[key].type = key;
  });

  return options as Record<PluginKey, SlatePluginOptions>;
};
