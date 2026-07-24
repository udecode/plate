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
    render: { node: CodeBlockElementStatic },
  }),
  BaseCodeLinePlugin.withComponent(CodeLineElementStatic),
  BaseCodeHighlightPlugin.configure({
    options: { lowlight },
    render: { node: CodeSyntaxLeafStatic },
  }),
];
