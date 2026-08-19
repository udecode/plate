import { CalloutElementDocx } from '@/registry/components/editor/callout-static';
import {
  CodeBlockElementDocx,
  CodeLineElementDocx,
  CodeSyntaxLeafDocx,
} from '@/registry/components/editor/code-block-static';
import {
  ColumnElementDocx,
  ColumnGroupElementDocx,
} from '@/registry/components/editor/column-static';
import {
  EquationElementDocx,
  InlineEquationElementDocx,
} from '@/registry/components/editor/math-static';
import { HeadingElementDocx } from '@/registry/components/editor/heading-static';
import { TocElementDocx } from '@/registry/components/editor/toc-static';
import { BaseHeadingPlugin } from '@platejs/basic-nodes';
import { BaseCalloutPlugin } from '@platejs/callout';
import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
} from '@platejs/code-block';
import { BaseColumnItemPlugin, BaseColumnPlugin } from '@platejs/layout';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '@platejs/math';
import { BaseTocPlugin } from '@platejs/toc';

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
  BaseCodeBlockPlugin.configure({
    component: CodeBlockElementDocx,
  }),
  BaseCodeLinePlugin.configure({
    component: CodeLineElementDocx,
  }),
  BaseCodeHighlightPlugin.configure({
    component: CodeSyntaxLeafDocx,
  }),
  BaseColumnItemPlugin.configure({
    component: ColumnElementDocx,
  }),
  BaseColumnPlugin.configure({
    component: ColumnGroupElementDocx,
  }),
  BaseEquationPlugin.configure({
    component: EquationElementDocx,
  }),
  BaseInlineEquationPlugin.configure({
    component: InlineEquationElementDocx,
  }),
  BaseCalloutPlugin.configure({
    component: CalloutElementDocx,
  }),
  BaseHeadingPlugin.configure({
    component: HeadingElementDocx,
  }),
  BaseTocPlugin.configure({
    component: TocElementDocx,
  }),
];
