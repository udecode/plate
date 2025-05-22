'use client';

import { withProps } from '@udecode/cn';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { Key, ParagraphPlugin } from '@udecode/plate/react';
import { all, createLowlight } from 'lowlight';

import { BlockquoteElement } from '@/registry/ui/blockquote-node';
import {
  CodeBlockElement,
  CodeLineElement,
  CodeSyntaxLeaf,
} from '@/registry/ui/code-block-node';
import { HeadingElement } from '@/registry/ui/heading-node';
import { ParagraphElement } from '@/registry/ui/paragraph-node';

const lowlight = createLowlight(all);

export const BasicElementsKit = [
  ParagraphPlugin.withComponent(ParagraphElement),
  BlockquotePlugin.configure(() => ({
    shortcuts: {
      toggleBlockquote: {
        keys: [[Key.Mod, Key.Shift, 'period']],
      },
    },
  })).withComponent(BlockquoteElement),
  HeadingPlugin.configure({
    options: { levels: 3 },
    override: {
      components: {
        h1: withProps(HeadingElement, { variant: 'h1' }),
        h2: withProps(HeadingElement, { variant: 'h2' }),
        h3: withProps(HeadingElement, { variant: 'h3' }),
        h4: withProps(HeadingElement, { variant: 'h4' }),
        h5: withProps(HeadingElement, { variant: 'h5' }),
        h6: withProps(HeadingElement, { variant: 'h6' }),
      },
    },
  }),
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
