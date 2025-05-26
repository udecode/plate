'use client';

import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { all, createLowlight } from 'lowlight';

import {
  CodeBlockElement,
  CodeLineElement,
  CodeSyntaxLeaf,
} from '@/registry/ui/code-block-node';

const lowlight = createLowlight(all);

export const CodeBlockKit = [
  CodeBlockPlugin.configure({
    options: { lowlight },
    override: {
      components: {
        code_block: CodeBlockElement,
        code_line: CodeLineElement,
        code_syntax: CodeSyntaxLeaf,
      },
    },
  }),
];
