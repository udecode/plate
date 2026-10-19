import { DocxExportPlugin } from '@platejs/docx-io';
import { KEYS } from 'platejs';
import { CalloutElementDocx } from '@/components/ui/callout-node-static';
import {
  CodeBlockElementDocx,
  CodeLineElementDocx,
  CodeSyntaxLeafDocx,
} from '@/components/ui/code-block-node-static';
import {
  ColumnElementDocx,
  ColumnGroupElementDocx,
} from '@/components/ui/column-node-static';
import {
  EquationElementDocx,
  InlineEquationElementDocx,
} from '@/components/ui/equation-node-static';
import { TocElementDocx } from '@/components/ui/toc-node-static';

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
        [KEYS.codeBlock]: CodeBlockElementDocx,
        [KEYS.codeLine]: CodeLineElementDocx,
        [KEYS.codeSyntax]: CodeSyntaxLeafDocx,
        [KEYS.column]: ColumnElementDocx,
        [KEYS.columnGroup]: ColumnGroupElementDocx,
        [KEYS.equation]: EquationElementDocx,
        [KEYS.inlineEquation]: InlineEquationElementDocx,
        [KEYS.callout]: CalloutElementDocx,
        [KEYS.toc]: TocElementDocx,
      },
    },
  }),
];
