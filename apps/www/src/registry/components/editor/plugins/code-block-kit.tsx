'use client';

import { CodeBlockRules } from '@platejs/code-block';
import {
  CodeBlockPlugin,
  CodeHighlightPlugin,
  CodeLinePlugin,
} from '@platejs/code-block/react';
import { all, createLowlight } from 'lowlight';

import {
  CodeBlockElement,
  CodeLineElement,
  CodeSyntaxLeaf,
} from '@/registry/ui/code-block-node';

const lowlight = createLowlight(all);

export const CodeBlockKit = [
  CodeBlockPlugin.configure({
    component: CodeBlockElement,
    inputRules: [CodeBlockRules.markdown({ on: 'match' })],
    shortcuts: { toggle: { keys: 'mod+alt+8' } },
  }),
  CodeLinePlugin.configure({ component: CodeLineElement }),
  CodeHighlightPlugin.configure({
    component: CodeSyntaxLeaf,
    initialState: { lowlight },
  }),
];
