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
import {
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
} from '@platejs/basic-nodes';
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
  BaseH1Plugin.configure({
    component: H1ElementDocx,
  }),
  BaseH2Plugin.configure({
    component: H2ElementDocx,
  }),
  BaseH3Plugin.configure({
    component: H3ElementDocx,
  }),
  BaseH4Plugin.configure({
    component: H4ElementDocx,
  }),
  BaseH5Plugin.configure({
    component: H5ElementDocx,
  }),
  BaseH6Plugin.configure({
    component: H6ElementDocx,
  }),
  BaseTocPlugin.configure({
    component: TocElementDocx,
  }),
];
