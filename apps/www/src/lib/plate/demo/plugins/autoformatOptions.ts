import {
  type AutoformatBlockRule,
  type AutoformatPluginOptions,
  type AutoformatRule,
  autoformatArrow,
  autoformatLegal,
  autoformatLegalHtml,
  autoformatMath,
  autoformatPunctuation,
  autoformatSmartQuotes,
} from '@udecode/plate-autoformat';
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
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import {
  ELEMENT_DEFAULT,
  type PlateEditor,
  getParentNode,
  insertNodes,
  isBlock,
  isElement,
  isType,
  setNodes,
} from '@udecode/plate-common';
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
import {
  KEY_TODO_STYLE_TYPE,
  ListStyleType,
  toggleIndentList,
} from '@udecode/plate-indent-list';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  type TTodoListItemElement,
  toggleList,
  unwrapList,
} from '@udecode/plate-list';
import { ELEMENT_TOGGLE, openNextToggles } from '@udecode/plate-toggle';

export const preFormat: AutoformatBlockRule['preFormat'] = (editor) =>
  unwrapList(editor);

export const format = (editor: PlateEditor, customFormatting: any) => {
  if (editor.selection) {
    const parentEntry = getParentNode(editor, editor.selection);

    if (!parentEntry) return;

    const [node] = parentEntry;

    if (
      isElement(node) &&
      !isType(editor, node, ELEMENT_CODE_BLOCK) &&
      !isType(editor, node, ELEMENT_CODE_LINE)
    ) {
      customFormatting();
    }
  }
};

export const formatList = (editor: PlateEditor, elementType: string) => {
  format(editor, () =>
    toggleList(editor, {
      type: elementType,
    })
  );
};

export const autoformatMarks: AutoformatRule[] = [
  {
    match: '***',
    mode: 'mark',
    type: [MARK_BOLD, MARK_ITALIC],
  },
  {
    match: '__*',
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_ITALIC],
  },
  {
    match: '__**',
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_BOLD],
  },
  {
    match: '___***',
    mode: 'mark',
    type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
  },
  {
    match: '**',
    mode: 'mark',
    type: MARK_BOLD,
  },
  {
    match: '__',
    mode: 'mark',
    type: MARK_UNDERLINE,
  },
  {
    match: '*',
    mode: 'mark',
    type: MARK_ITALIC,
  },
  {
    match: '_',
    mode: 'mark',
    type: MARK_ITALIC,
  },
  {
    match: '~~',
    mode: 'mark',
    type: MARK_STRIKETHROUGH,
  },
  {
    match: '^',
    mode: 'mark',
    type: MARK_SUPERSCRIPT,
  },
  {
    match: '~',
    mode: 'mark',
    type: MARK_SUBSCRIPT,
  },
  {
    match: '==',
    mode: 'mark',
    type: MARK_HIGHLIGHT,
  },
  {
    match: '≡',
    mode: 'mark',
    type: MARK_HIGHLIGHT,
  },
  {
    match: '`',
    mode: 'mark',
    type: MARK_CODE,
  },
];

export const autoformatBlocks: AutoformatRule[] = [
  {
    match: '# ',
    mode: 'block',
    preFormat,
    type: ELEMENT_H1,
  },
  {
    match: '## ',
    mode: 'block',
    preFormat,
    type: ELEMENT_H2,
  },
  {
    match: '### ',
    mode: 'block',
    preFormat,
    type: ELEMENT_H3,
  },
  {
    match: '#### ',
    mode: 'block',
    preFormat,
    type: ELEMENT_H4,
  },
  {
    match: '##### ',
    mode: 'block',
    preFormat,
    type: ELEMENT_H5,
  },
  {
    match: '###### ',
    mode: 'block',
    preFormat,
    type: ELEMENT_H6,
  },
  {
    match: '> ',
    mode: 'block',
    preFormat,
    type: ELEMENT_BLOCKQUOTE,
  },
  {
    format: (editor) => {
      insertEmptyCodeBlock(editor, {
        defaultType: ELEMENT_DEFAULT,
        insertNodesOptions: { select: true },
      });
    },
    match: '```',
    mode: 'block',
    preFormat,
    triggerAtBlockStart: false,
    type: ELEMENT_CODE_BLOCK,
  },
  {
    match: '+ ',
    mode: 'block',
    preFormat: openNextToggles,
    type: ELEMENT_TOGGLE,
  },
  {
    format: (editor) => {
      setNodes(editor, { type: ELEMENT_HR });
      insertNodes(editor, {
        children: [{ text: '' }],
        type: ELEMENT_DEFAULT,
      });
    },
    match: ['---', '—-', '___ '],
    mode: 'block',
    type: ELEMENT_HR,
  },
];

export const autoformatRules: AutoformatRule[] = [
  ...autoformatBlocks,
  ...autoformatMarks,
  ...autoformatSmartQuotes,
  ...autoformatPunctuation,
  ...autoformatLegal,
  ...autoformatLegalHtml,
  ...autoformatArrow,
  ...autoformatMath,
];

export const autoformatLists: AutoformatRule[] = [
  {
    format: (editor) => formatList(editor, ELEMENT_UL),
    match: ['* ', '- '],
    mode: 'block',
    preFormat,
    type: ELEMENT_LI,
  },
  {
    format: (editor) => formatList(editor, ELEMENT_OL),
    match: ['1. ', '1) '],
    mode: 'block',
    preFormat,
    type: ELEMENT_LI,
  },
  {
    match: '[] ',
    mode: 'block',
    type: ELEMENT_TODO_LI,
  },
  {
    format: (editor) =>
      setNodes<TTodoListItemElement>(
        editor,
        { checked: true, type: ELEMENT_TODO_LI },
        {
          match: (n) => isBlock(editor, n),
        }
      ),
    match: '[x] ',
    mode: 'block',
    type: ELEMENT_TODO_LI,
  },
];

export const autoformatIndentLists: AutoformatRule[] = [
  {
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
    match: ['* ', '- '],
    mode: 'block',
    type: 'list',
  },
  {
    format: (editor) =>
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      }),
    match: ['1. ', '1) '],
    mode: 'block',
    type: 'list',
  },
  {
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: KEY_TODO_STYLE_TYPE,
      });
      setNodes(editor, {
        checked: false,
        listStyleType: KEY_TODO_STYLE_TYPE,
      });
    },
    match: ['[] '],
    mode: 'block',
    type: 'list',
  },
  {
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: KEY_TODO_STYLE_TYPE,
      });
      setNodes(editor, {
        checked: true,
        listStyleType: KEY_TODO_STYLE_TYPE,
      });
    },
    match: ['[x] '],
    mode: 'block',
    type: 'list',
  },
];

export const getAutoformatOptions = (
  id: string | undefined,
  enabled?: Record<string, boolean>
): Partial<AutoformatPluginOptions> => {
  const autoformatOptions: Partial<AutoformatPluginOptions> = {
    enableUndoOnDelete: true,
    rules: [...autoformatRules],
  };

  if (id === 'indentlist') {
    autoformatOptions.rules?.push(...autoformatIndentLists);
  }

  {
    autoformatOptions.rules?.push(...autoformatLists);
  }

  if (enabled?.listStyleType) {
    autoformatOptions.rules?.push(...autoformatIndentLists);
  } else if (enabled?.list) {
    autoformatOptions.rules?.push(...autoformatLists);
  }

  return autoformatOptions;
};
