import {
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
} from '@platejs/basic-nodes';
import { BaseTocPlugin } from '@platejs/toc';

import {
  H1ElementStaticDocx,
  H2ElementStaticDocx,
  H3ElementStaticDocx,
  H4ElementStaticDocx,
  H5ElementStaticDocx,
  H6ElementStaticDocx,
} from '@/registry/ui/heading-node-static-docx';
import { TocElementStaticDocx } from '@/registry/ui/toc-node-static-docx';

/**
 * TOC kit for DOCX export.
 * Includes heading components with bookmark anchors and TOC with internal links.
 */
export const DocxTocKit = [
  BaseTocPlugin.withComponent(TocElementStaticDocx),
  BaseH1Plugin.withComponent(H1ElementStaticDocx),
  BaseH2Plugin.withComponent(H2ElementStaticDocx),
  BaseH3Plugin.withComponent(H3ElementStaticDocx),
  BaseH4Plugin.withComponent(H4ElementStaticDocx),
  BaseH5Plugin.withComponent(H5ElementStaticDocx),
  BaseH6Plugin.withComponent(H6ElementStaticDocx),
];
