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

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@platejs/code-block';
import { BaseCalloutPlugin } from '@platejs/callout';
import { BaseColumnItemPlugin, BaseColumnPlugin } from '@platejs/layout';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '@platejs/math';
import { BaseTocPlugin } from '@platejs/toc';
import { all, createLowlight } from 'lowlight';

import { BaseAlignKit } from './plugins/align-base-kit';
import { BaseBasicBlocksKit } from './plugins/basic-blocks-base-kit';
import { BaseBasicMarksKit } from './plugins/basic-marks-base-kit';
import { BaseCommentKit } from './plugins/comment-base-kit';
import { BaseDateKit } from './plugins/date-base-kit';
import { BaseFontKit } from './plugins/font-base-kit';
import { BaseLineHeightKit } from './plugins/line-height-base-kit';
import { BaseLinkKit } from './plugins/link-base-kit';
import { BaseListKit } from './plugins/list-base-kit';
import { MarkdownKit } from './plugins/markdown-kit';
import { BaseMediaKit } from './plugins/media-base-kit';
import { BaseMentionKit } from './plugins/mention-base-kit';
import { BaseSuggestionKit } from './plugins/suggestion-base-kit';
import { BaseTableKit } from './plugins/table-base-kit';
import { BaseToggleKit } from './plugins/toggle-base-kit';

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

const lowlight = createLowlight(all);

// DOCX-specific kits with inline styles
const DocxCodeBlockKit = [
  BaseCodeBlockPlugin.configure({
    node: { component: CodeBlockElementStaticDocx },
    options: { lowlight },
  }),
  BaseCodeLinePlugin.withComponent(CodeLineElementStaticDocx),
  BaseCodeSyntaxPlugin.withComponent(CodeSyntaxLeafStaticDocx),
];

const DocxColumnKit = [
  BaseColumnPlugin.withComponent(ColumnGroupElementStaticDocx),
  BaseColumnItemPlugin.withComponent(ColumnElementStaticDocx),
];

const DocxMathKit = [
  BaseInlineEquationPlugin.withComponent(InlineEquationElementStaticDocx),
  BaseEquationPlugin.withComponent(EquationElementStaticDocx),
];

const DocxCalloutKit = [
  BaseCalloutPlugin.withComponent(CalloutElementStaticDocx),
];

const DocxTocKit = [BaseTocPlugin.withComponent(TocElementStaticDocx)];

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
  ...BaseBasicBlocksKit,
  ...DocxCodeBlockKit,
  ...BaseTableKit,
  ...BaseToggleKit,
  ...DocxTocKit,
  ...BaseMediaKit,
  ...DocxCalloutKit,
  ...DocxColumnKit,
  ...DocxMathKit,
  ...BaseDateKit,
  ...BaseLinkKit,
  ...BaseMentionKit,
  ...BaseBasicMarksKit,
  ...BaseFontKit,
  ...BaseListKit,
  ...BaseAlignKit,
  ...BaseLineHeightKit,
  ...BaseCommentKit,
  ...BaseSuggestionKit,
  ...MarkdownKit,
];
