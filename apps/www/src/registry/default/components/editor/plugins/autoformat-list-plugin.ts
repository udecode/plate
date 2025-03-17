'use client';

import type { SlateEditor } from '@udecode/plate';
import type {
  AutoformatBlockRule,
  AutoformatRule,
} from '@udecode/plate-autoformat';

import { ElementApi, isType } from '@udecode/plate';
import {
  autoformatArrow,
  autoformatLegal,
  autoformatLegalHtml,
  autoformatMath,
  autoformatPunctuation,
  autoformatSmartQuotes,
} from '@udecode/plate-autoformat';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { insertEmptyCodeBlock } from '@udecode/plate-code-block';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { toggleList, unwrapList } from '@udecode/plate-list';
import {
  BulletedListPlugin,
  ListItemPlugin,
  NumberedListPlugin,
  TodoListPlugin,
} from '@udecode/plate-list/react';
import { openNextToggles, TogglePlugin } from '@udecode/plate-toggle/react';
import { ParagraphPlugin } from '@udecode/plate/react';

const preFormat: AutoformatBlockRule['preFormat'] = (editor) =>
  unwrapList(editor);

const format = (editor: SlateEditor, customFormatting: any) => {
  if (editor.selection) {
    const parentEntry = editor.api.parent(editor.selection);

    if (!parentEntry) return;

    const [node] = parentEntry;

    if (
      ElementApi.isElement(node) &&
      !isType(editor, node, CodeBlockPlugin.key)
    ) {
      customFormatting();
    }
  }
};

const formatList = (editor: SlateEditor, elementType: string) => {
  format(editor, () =>
    toggleList(editor, {
      type: elementType,
    })
  );
};

const autoformatMarks: AutoformatRule[] = [
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

const autoformatBlocks: AutoformatRule[] = [
  {
    match: '# ',
    mode: 'block',
    preFormat,
    type: HEADING_KEYS.h1,
  },
  {
    match: '## ',
    mode: 'block',
    preFormat,
    type: HEADING_KEYS.h2,
  },
  {
    match: '### ',
    mode: 'block',
    preFormat,
    type: HEADING_KEYS.h3,
  },
  {
    match: '#### ',
    mode: 'block',
    preFormat,
    type: HEADING_KEYS.h4,
  },
  {
    match: '##### ',
    mode: 'block',
    preFormat,
    type: HEADING_KEYS.h5,
  },
  {
    match: '###### ',
    mode: 'block',
    preFormat,
    type: HEADING_KEYS.h6,
  },
  {
    match: '> ',
    mode: 'block',
    preFormat,
    type: BlockquotePlugin.key,
  },
  {
    match: '```',
    mode: 'block',
    preFormat,
    type: CodeBlockPlugin.key,
    format: (editor) => {
      insertEmptyCodeBlock(editor, {
        defaultType: ParagraphPlugin.key,
        insertNodesOptions: { select: true },
      });
    },
  },
  {
    match: '+ ',
    mode: 'block',
    preFormat: openNextToggles,
    type: TogglePlugin.key,
  },
  {
    match: ['---', '—-', '___ '],
    mode: 'block',
    type: HorizontalRulePlugin.key,
    format: (editor) => {
      editor.tf.setNodes({ type: HorizontalRulePlugin.key });
      editor.tf.insertNodes({
        children: [{ text: '' }],
        type: ParagraphPlugin.key,
      });
    },
  },
];

const autoformatLists: AutoformatRule[] = [
  {
    match: ['* ', '- '],
    mode: 'block',
    preFormat,
    type: ListItemPlugin.key,
    format: (editor) => formatList(editor, BulletedListPlugin.key),
  },
  {
    match: [String.raw`^\d+\.$ `, String.raw`^\d+\)$ `],
    matchByRegex: true,
    mode: 'block',
    preFormat,
    type: ListItemPlugin.key,
    format: (editor) => formatList(editor, NumberedListPlugin.key),
  },
  {
    match: '[] ',
    mode: 'block',
    type: TodoListPlugin.key,
  },
  {
    match: '[x] ',
    mode: 'block',
    type: TodoListPlugin.key,
    format: (editor) =>
      editor.tf.setNodes(
        { checked: true, type: TodoListPlugin.key },
        {
          match: (n) => editor.api.isBlock(n),
        }
      ),
  },
];

export const autoformatListPlugin = AutoformatPlugin.configure({
  options: {
    enableUndoOnDelete: true,
    rules: [
      ...autoformatBlocks,
      ...autoformatMarks,
      ...autoformatSmartQuotes,
      ...autoformatPunctuation,
      ...autoformatLegal,
      ...autoformatLegalHtml,
      ...autoformatArrow,
      ...autoformatMath,
      ...autoformatLists,
    ].map((rule) => ({
      ...rule,
      query: (editor) =>
        !editor.api.some({ match: { type: editor.getType(CodeBlockPlugin) } }),
    })),
  },
});
