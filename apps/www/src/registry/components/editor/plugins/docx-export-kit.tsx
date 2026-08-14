/**
 * Editor kit optimized for DOCX export.
 *
 * Uses DOCX-specific static components for elements that require specialized
 * markup or inline styles instead of Tailwind classes:
 * - Code blocks: Need inline syntax highlighting colors and line breaks
 * - Columns: Need table layout instead of flexbox
 * - Equations: Need inline font styling (KaTeX doesn't work in DOCX)
 * - Callouts: Need table layout for icon + content
 * - Headings: Need bookmark anchors for TOC links
 * - TOC: Need anchor links with proper paragraph breaks
 *
 * Tables use base version with juice CSS inlining.
 */

import { CalloutElementDocx } from '@/registry/ui/callout-node-static';
import {
  CodeBlockElementDocx,
  CodeLineElementDocx,
  CodeSyntaxLeafDocx,
} from '@/registry/ui/code-block-node-static';
import {
  ColumnElementDocx,
  ColumnGroupElementDocx,
} from '@/registry/ui/column-node-static';
import {
  EquationElementDocx,
  InlineEquationElementDocx,
} from '@/registry/ui/equation-node-static';
import {
  H1ElementDocx,
  H2ElementDocx,
  H3ElementDocx,
  H4ElementDocx,
  H5ElementDocx,
  H6ElementDocx,
} from '@/registry/ui/heading-node-static';
import { TocElementDocx } from '@/registry/ui/toc-node-static';
import { DocxIOPlugin } from '@platejs/docx-io';
import { PLUGINS } from 'platejs';

/**
 * Editor kit for DOCX export.
 *
 * Uses standard static components for most elements (with juice CSS inlining),
 * but uses docx-specific components for elements that need special handling:
 * - Code blocks (syntax highlighting, line breaks)
 * - Columns (table layout instead of flexbox)
 * - Equations (inline font instead of KaTeX)
 * - Callouts (table layout for icon placement)
 * - Headings (bookmark anchors for TOC links)
 * - TOC (anchor links with paragraph breaks)
 *
 * Tables use base version with juice CSS inlining.
 */
export const DocxExportKit = [
  DocxIOPlugin.configure({
    override: {
      components: {
        [PLUGINS.codeBlock]: CodeBlockElementDocx,
        [PLUGINS.codeLine]: CodeLineElementDocx,
        [PLUGINS.codeSyntax]: CodeSyntaxLeafDocx,
        [PLUGINS.column]: ColumnElementDocx,
        [PLUGINS.columnGroup]: ColumnGroupElementDocx,
        [PLUGINS.equation]: EquationElementDocx,
        [PLUGINS.inlineEquation]: InlineEquationElementDocx,
        [PLUGINS.callout]: CalloutElementDocx,
        [PLUGINS.h1]: H1ElementDocx,
        [PLUGINS.h2]: H2ElementDocx,
        [PLUGINS.h3]: H3ElementDocx,
        [PLUGINS.h4]: H4ElementDocx,
        [PLUGINS.h5]: H5ElementDocx,
        [PLUGINS.h6]: H6ElementDocx,
        [PLUGINS.toc]: TocElementDocx,
      },
    },
  }),
];
