import { BaseParagraphPlugin } from 'platejs';

import { ParagraphElementStaticDocx } from '@/registry/ui/paragraph-node-static-docx';

/**
 * Basic blocks kit for DOCX export.
 * Uses <p> tags instead of <div> for proper inline element handling.
 */
export const DocxBasicBlocksKit = [
  BaseParagraphPlugin.withComponent(ParagraphElementStaticDocx),
];
