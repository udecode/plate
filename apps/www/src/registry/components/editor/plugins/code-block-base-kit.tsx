import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
} from '@platejs/code-block';
import { all, createLowlight } from 'lowlight';

import {
  CodeBlockElementStatic,
  CodeLineElementStatic,
  CodeSyntaxLeafStatic,
} from '@/registry/ui/code-block-node-static';

const lowlight = createLowlight(all);

export const BaseCodeBlockKit = [
  BaseCodeBlockPlugin.configure({
    component: CodeBlockElementStatic,
  }),
  BaseCodeLinePlugin.configure({
    component: CodeLineElementStatic,
  }),
  BaseCodeHighlightPlugin.configure({
    component: CodeSyntaxLeafStatic,
    options: { lowlight },
  }),
];
