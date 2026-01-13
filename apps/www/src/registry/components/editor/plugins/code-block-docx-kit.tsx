import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@platejs/code-block';
import { all, createLowlight } from 'lowlight';

import {
  CodeBlockElementStaticDocx,
  CodeLineElementStaticDocx,
  CodeSyntaxLeafStaticDocx,
} from '@/registry/ui/code-block-node-static-docx';

const lowlight = createLowlight(all);

/**
 * Code block kit for DOCX export.
 * Uses inline styles for syntax highlighting instead of CSS classes.
 */
export const DocxCodeBlockKit = [
  BaseCodeBlockPlugin.configure({
    node: { component: CodeBlockElementStaticDocx },
    options: { lowlight },
  }),
  BaseCodeLinePlugin.withComponent(CodeLineElementStaticDocx),
  BaseCodeSyntaxPlugin.withComponent(CodeSyntaxLeafStaticDocx),
];
