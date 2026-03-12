'use client';

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
 * Editor kit optimized for DOCX export.
 *
 * Uses docx-specific static components for elements that require
 * inline styles instead of Tailwind classes.
 */
export const DocxExportKit = [
  DocxExportPlugin.configure({
    override: {
      components: {
        [KEYS.callout]: CalloutElementDocx,
        [KEYS.codeBlock]: CodeBlockElementDocx,
        [KEYS.codeLine]: CodeLineElementDocx,
        [KEYS.codeSyntax]: CodeSyntaxLeafDocx,
        [KEYS.column]: ColumnElementDocx,
        [KEYS.columnGroup]: ColumnGroupElementDocx,
        [KEYS.equation]: EquationElementDocx,
        [KEYS.inlineEquation]: InlineEquationElementDocx,
        [KEYS.toc]: TocElementDocx,
      },
    },
  }),
];
