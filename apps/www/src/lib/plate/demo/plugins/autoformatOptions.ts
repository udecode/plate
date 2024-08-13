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
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { BlockquotePlugin } from '@udecode/plate-block-quote';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import {
  ParagraphPlugin,
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
import { HighlightPlugin } from '@udecode/plate-highlight';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import {
  KEY_TODO_STYLE_TYPE,
  ListStyleType,
  toggleIndentList,
} from '@udecode/plate-indent-list';
import {
  ListItemPlugin,
  ListOrderedPlugin,
  ListUnorderedPlugin,
  type TTodoListItemElement,
  TodoListPlugin,
  toggleList,
  unwrapList,
} from '@udecode/plate-list';
import { TogglePlugin, openNextToggles } from '@udecode/plate-toggle';

export const preFormat: AutoformatBlockRule['preFormat'] = (editor) =>
  unwrapList(editor);

export const format = (editor: PlateEditor, customFormatting: any) => {
  if (editor.selection) {
    const parentEntry = getParentNode(editor, editor.selection);

    if (!parentEntry) return;

    const [node] = parentEntry;

    if (
      isElement(node) &&
      !isType(editor, node, CodeBlockPlugin.key) &&
      !isType(editor, node, CodeLinePlugin.key)
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
    type: [BoldPlugin.key, ItalicPlugin.key],
  },
  {
    match: '__*',
    mode: 'mark',
    type: [UnderlinePlugin.key, ItalicPlugin.key],
  },
  {
    match: '__**',
    mode: 'mark',
    type: [UnderlinePlugin.key, BoldPlugin.key],
  },
  {
    match: '___***',
    mode: 'mark',
    type: [UnderlinePlugin.key, BoldPlugin.key, ItalicPlugin.key],
  },
  {
    match: '**',
    mode: 'mark',
    type: BoldPlugin.key,
  },
  {
    match: '__',
    mode: 'mark',
    type: UnderlinePlugin.key,
  },
  {
    match: '*',
    mode: 'mark',
    type: ItalicPlugin.key,
  },
  {
    match: '_',
    mode: 'mark',
    type: ItalicPlugin.key,
  },
  {
    match: '~~',
    mode: 'mark',
    type: StrikethroughPlugin.key,
  },
  {
    match: '^',
    mode: 'mark',
    type: SuperscriptPlugin.key,
  },
  {
    match: '~',
    mode: 'mark',
    type: SubscriptPlugin.key,
  },
  {
    match: '==',
    mode: 'mark',
    type: HighlightPlugin.key,
  },
  {
    match: '≡',
    mode: 'mark',
    type: HighlightPlugin.key,
  },
  {
    match: '`',
    mode: 'mark',
    type: CodePlugin.key,
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
    type: BlockquotePlugin.key,
  },
  {
    format: (editor) => {
      insertEmptyCodeBlock(editor, {
        defaultType: ParagraphPlugin.key,
        insertNodesOptions: { select: true },
      });
    },
    match: '```',
    mode: 'block',
    preFormat,
    triggerAtBlockStart: false,
    type: CodeBlockPlugin.key,
  },
  {
    match: '+ ',
    mode: 'block',
    preFormat: openNextToggles,
    type: TogglePlugin.key,
  },
  {
    format: (editor) => {
      setNodes(editor, { type: HorizontalRulePlugin.key });
      insertNodes(editor, {
        children: [{ text: '' }],
        type: ParagraphPlugin.key,
      });
    },
    match: ['---', '—-', '___ '],
    mode: 'block',
    type: HorizontalRulePlugin.key,
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
    format: (editor) => formatList(editor, ListUnorderedPlugin.key),
    match: ['* ', '- '],
    mode: 'block',
    preFormat,
    type: ListItemPlugin.key,
  },
  {
    format: (editor) => formatList(editor, ListOrderedPlugin.key),
    match: ['1. ', '1) '],
    mode: 'block',
    preFormat,
    type: ListItemPlugin.key,
  },
  {
    match: '[] ',
    mode: 'block',
    type: TodoListPlugin.key,
  },
  {
    format: (editor) =>
      setNodes<TTodoListItemElement>(
        editor,
        { checked: true, type: TodoListPlugin.key },
        {
          match: (n) => isBlock(editor, n),
        }
      ),
    match: '[x] ',
    mode: 'block',
    type: TodoListPlugin.key,
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
  id?: string,
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
