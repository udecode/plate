'use client';

import { CodeBlockRules } from '@platejs/code-block';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
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
    inputRules: [CodeBlockRules.markdown({ on: 'match' })],
    options: { lowlight },
    render: { node: CodeBlockElement },
    shortcuts: { toggle: { keys: 'mod+alt+8' } },
  }),
  CodeLinePlugin.withComponent(CodeLineElement),
  CodeSyntaxPlugin.withComponent(CodeSyntaxLeaf),
];
