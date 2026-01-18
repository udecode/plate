/**
 * Editor kit optimized for DOCX export.
 *
 * Uses docx-specific static components for elements that require
 * inline styles instead of Tailwind classes (which don't work in DOCX):
 * - Code blocks: Need inline syntax highlighting colors and line breaks
 * - Columns: Need table layout instead of flexbox
 * - Equations: Need inline font styling (KaTeX doesn't work in DOCX)
 * - Callouts: Need table layout for icon + content
 * - TOC: Need anchor links with proper paragraph breaks
 *
 * Tables use base version with juice CSS inlining.
 */

import { CalloutElementStaticDocx } from '@/registry/ui/callout-node-static-docx';
import {
  CodeBlockElementStaticDocx,
  CodeLineElementStaticDocx,
  CodeSyntaxLeafStaticDocx,
} from '@/registry/ui/code-block-node-static-docx';
import {
  ColumnElementStaticDocx,
  ColumnGroupElementStaticDocx,
} from '@/registry/ui/column-node-static-docx';
import {
  EquationElementStaticDocx,
  InlineEquationElementStaticDocx,
} from '@/registry/ui/equation-node-static-docx';
import { TocElementStaticDocx } from '@/registry/ui/toc-node-static-docx';
import { DocxExportPlugin } from '@platejs/docx-io';
import { KEYS } from 'platejs';

/**
 * Editor kit for DOCX export.
 *
 * Uses standard static components for most elements (with juice CSS inlining),
 * but uses docx-specific components for elements that need special handling:
 * - Code blocks (syntax highlighting, line breaks)
 * - Columns (table layout instead of flexbox)
 * - Equations (inline font instead of KaTeX)
 * - Callouts (table layout for icon placement)
 * - TOC (anchor links with paragraph breaks)
 *
 * Tables use base version with juice CSS inlining.
 */
export const DocxExportKit = [
  DocxExportPlugin.configure({
    override: {
      components: {
        [KEYS.codeBlock]: CodeBlockElementStaticDocx,
        [KEYS.codeLine]: CodeLineElementStaticDocx,
        [KEYS.codeSyntax]: CodeSyntaxLeafStaticDocx,
        [KEYS.column]: ColumnElementStaticDocx,
        [KEYS.columnGroup]: ColumnGroupElementStaticDocx,
        [KEYS.equation]: EquationElementStaticDocx,
        [KEYS.inlineEquation]: InlineEquationElementStaticDocx,
        [KEYS.callout]: CalloutElementStaticDocx,
        [KEYS.toc]: TocElementStaticDocx,
      },
    },
  }),
];
