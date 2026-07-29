'use client';

import {
  BoldRules,
  CodeRules,
  HighlightRules,
  ItalicRules,
  MarkComboRules,
  ScriptRules,
  StrikethroughRules,
  UnderlineRules,
} from '@platejs/basic-nodes';
import {
  BoldPlugin,
  CodePlugin,
  HighlightPlugin,
  ItalicPlugin,
  KbdPlugin,
  ScriptPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';

import { CodeLeaf } from '@/registry/ui/code-node';
import { HighlightLeaf } from '@/registry/ui/highlight-node';
import { KbdLeaf } from '@/registry/ui/kbd-node';

export const BasicMarksKit = [
  BoldPlugin.configure({
    inputRules: [
      BoldRules.markdown({ variant: '*' }),
      BoldRules.markdown({ variant: '_' }),
      MarkComboRules.markdown({ variant: 'boldItalic' }),
      MarkComboRules.markdown({ variant: 'boldUnderline' }),
      MarkComboRules.markdown({ variant: 'boldItalicUnderline' }),
      MarkComboRules.markdown({ variant: 'italicUnderline' }),
    ],
  }),
  ItalicPlugin.configure({
    inputRules: [
      ItalicRules.markdown({ variant: '*' }),
      ItalicRules.markdown({ variant: '_' }),
    ],
  }),
  UnderlinePlugin.configure({
    inputRules: [UnderlineRules.markdown()],
  }),
  CodePlugin.configure({
    component: CodeLeaf,
    inputRules: [CodeRules.markdown()],
    shortcuts: { toggle: { keys: 'mod+e' } },
  }),
  StrikethroughPlugin.configure({
    inputRules: [StrikethroughRules.markdown()],
    shortcuts: { toggle: { keys: 'mod+shift+x' } },
  }),
  ScriptPlugin.configure({
    inputRules: [
      ScriptRules.markdown({ value: 'sub' }),
      ScriptRules.markdown({ value: 'sup' }),
    ],
    shortcuts: {
      subscript: {
        keys: 'mod+comma',
        handler: ({ editor }) => {
          editor.plugin(ScriptPlugin).update.toggle('sub');
        },
      },
      superscript: {
        keys: 'mod+period',
        handler: ({ editor }) => {
          editor.plugin(ScriptPlugin).update.toggle('sup');
        },
      },
    },
  }),
  HighlightPlugin.configure({
    component: HighlightLeaf,
    inputRules: [
      HighlightRules.markdown({ variant: '==' }),
      HighlightRules.markdown({ variant: '≡' }),
    ],
    shortcuts: { toggle: { keys: 'mod+shift+h' } },
  }),
  KbdPlugin.configure({ component: KbdLeaf }),
] as const;
