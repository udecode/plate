import { hexToBase64, traverseHtmlElements } from '@udecode/plate-common/server';
import validator from 'validator';

import { getRtfImagesMap } from './getRtfImagesMap';
import { getVShapeSpid } from './getVShapeSpid';

/**
 * Clean docx image elements.
 */
export const cleanDocxImageElements = (
  document: Document,
  rtf: string,
  rootNode: Node
): void => {
  if (!rtf) {
    return;
  }

  traverseHtmlElements(rootNode, (element) => {
    if (!['IMG', 'V:IMAGEDATA'].includes(element.tagName)) {
      return true;
    }

    if (element.tagName === 'IMG') {
      const src = element.getAttribute('src');

      if (!src || !src.startsWith('file://')) {
        return true;
      }

      const alt = element.getAttribute('alt');

      if (
        typeof alt === 'string' &&
        validator.isURL(alt, { require_protocol: true })
      ) {
        element.setAttribute('src', alt);
        return true;
      }
    }

    const vShapeSpid = getVShapeSpid(document, element);

    if (!vShapeSpid) {
      return true;
    }

    const rtfImagesMap = getRtfImagesMap(rtf);
    const rtfImage = rtfImagesMap[vShapeSpid];

    if (!rtfImage) {
      // We fould some kind of vshape (perhaps a drawing) that we don't know
      // how to recover from RTF. So we just skip it.
      element.remove();
      return true;
    }

    const dataUri = `data:${rtfImage.mimeType};base64,${hexToBase64(
      rtfImage.hex
    )}`;

    if (element.tagName === 'IMG') {
      element.setAttribute('src', dataUri);
    } else if (element.parentNode && element.parentNode.parentNode) {
      const imageElement = document.createElement('img');
      imageElement.setAttribute('src', dataUri);
      element.parentNode.parentNode.replaceChild(
        imageElement,
        element.parentNode
      );
    }
    return true;
  });
};
