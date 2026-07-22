import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
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
    options: { lowlight },
    render: { node: CodeBlockElementStatic },
  }),
  BaseCodeLinePlugin.withComponent(CodeLineElementStatic),
  BaseCodeSyntaxPlugin.withComponent(CodeSyntaxLeafStatic),
];
