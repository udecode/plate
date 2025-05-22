'use client';

import type { AutoformatRule } from '@udecode/plate-autoformat';

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
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import {
  INDENT_LIST_KEYS,
  ListStyleType,
  toggleList,
} from '@udecode/plate-list';
import { ParagraphPlugin } from '@udecode/plate/react';

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
    type: 'h1',
  },
  {
    match: '## ',
    mode: 'block',
    type: 'h2',
  },
  {
    match: '### ',
    mode: 'block',
    type: 'h3',
  },
  {
    match: '#### ',
    mode: 'block',
    type: 'h4',
  },
  {
    match: '##### ',
    mode: 'block',
    type: 'h5',
  },
  {
    match: '###### ',
    mode: 'block',
    type: 'h6',
  },
  {
    match: '> ',
    mode: 'block',
    type: BlockquotePlugin.key,
  },
  {
    match: '```',
    mode: 'block',
    type: CodeBlockPlugin.key,
    format: (editor) => {
      insertEmptyCodeBlock(editor, {
        defaultType: ParagraphPlugin.key,
        insertNodesOptions: { select: true },
      });
    },
  },
  // {
  //   match: '+ ',
  //   mode: 'block',
  //   preFormat: openNextToggles,
  //   type: TogglePlugin.key,
  // },
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
    type: 'list',
    format: (editor) => {
      toggleList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
  },
  {
    match: [String.raw`^\d+\.$ `, String.raw`^\d+\)$ `],
    matchByRegex: true,
    mode: 'block',
    type: 'list',
    format: (editor, { matchString }) => {
      toggleList(editor, {
        listRestartPolite: Number(matchString) || 1,
        listStyleType: ListStyleType.Decimal,
      });
    },
  },
  {
    match: ['[] '],
    mode: 'block',
    type: 'list',
    format: (editor) => {
      toggleList(editor, {
        listStyleType: INDENT_LIST_KEYS.todo,
      });
      editor.tf.setNodes({
        checked: false,
        listStyleType: INDENT_LIST_KEYS.todo,
      });
    },
  },
  {
    match: ['[x] '],
    mode: 'block',
    type: 'list',
    format: (editor) => {
      toggleList(editor, {
        listStyleType: INDENT_LIST_KEYS.todo,
      });
      editor.tf.setNodes({
        checked: true,
        listStyleType: INDENT_LIST_KEYS.todo,
      });
    },
  },
];

export const AutoformatKit = [
  AutoformatPlugin.configure({
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
      ].map(
        (rule): AutoformatRule => ({
          ...rule,
          query: (editor) =>
            !editor.api.some({
              match: { type: editor.getType(CodeBlockPlugin) },
            }),
        })
      ),
    },
  }),
];
