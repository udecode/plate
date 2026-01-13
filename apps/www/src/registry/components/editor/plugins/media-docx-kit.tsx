import { BaseImagePlugin } from '@platejs/media';

import { ImageElementStaticDocx } from '@/registry/ui/media-image-node-static-docx';

/**
 * Media kit for DOCX export.
 * Uses inline styles for proper Word rendering.
 * Note: Only images are supported in DOCX. Video/audio will be skipped.
 */
export const DocxMediaKit = [
  BaseImagePlugin.withComponent(ImageElementStaticDocx),
];
