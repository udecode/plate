import {
  getHtmlComments,
  isHtmlComment,
  isHtmlBlockElement,
  isHtmlText,
  postCleanHtml,
  removeHtmlNodesBetweenComments,
  replaceTagName,
  traverseHtmlElements,
  traverseHtmlNode,
} from '@platejs/core/internal';
import validator from 'validator';

type RtfImage = {
  hex: string;
  mimeType: string;
  spid: string;
};

const V_SHAPE_ID = /\bid="([^"]+)"/i;
const V_SHAPE_OPEN_TAG = /<v:shape\b[^>]*>/gi;
const V_SHAPE_SPID = /\bo:spid="([^"]+)"/i;

const getRtfImageHex = (imageData: string): string | null => {
  const [, bliptagData = ''] = imageData.split('bliptag');
  const bracketSplit = bliptagData.split('}');

  if (bracketSplit.length < 2) return null;

  const [beforeBracket, afterBracket] = bracketSplit;

  if (bracketSplit.length > 2 && beforeBracket.includes('blipuid')) {
    return afterBracket.split(' ').join('');
  }

  const spaceSplit = beforeBracket.split(' ');

  if (spaceSplit.length < 2) return null;

  return spaceSplit.slice(1).join('');
};

const getRtfImagesByType = (
  rtf: string,
  spidPrefix: string,
  type: string
): RtfImage[] => {
  const escapedType = type.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  const [, ...images] = rtf.split(new RegExp(`${escapedType}(?![a-zA-Z])`));

  return images.reduce<RtfImage[]>((rtfImages, image) => {
    const [, imageData = ''] = image.split('shplid');
    const indexes = ['\\', '{', '\r', '\n', ' ']
      .map((character) => imageData.indexOf(character))
      .filter((index) => index !== -1);
    const idLength = Math.min(imageData.length, ...indexes);
    const id = imageData.slice(0, Math.max(0, idLength));
    const spid = id ? `${spidPrefix}${id}` : null;
    const [bliptagMeta] = imageData.split('bliptag');
    const mimeType = bliptagMeta.includes('pngblip')
      ? 'image/png'
      : bliptagMeta.includes('jpegblip')
        ? 'image/jpeg'
        : null;
    const hex = getRtfImageHex(imageData);

    if (spid && mimeType && hex) rtfImages.push({ hex, mimeType, spid });

    return rtfImages;
  }, []);
};

const getRtfImagesMap = (rtf: string): Record<string, RtfImage> => {
  const images: Record<string, RtfImage> = {};

  for (const image of getRtfImagesByType(rtf, 'i', String.raw`\shppict`)) {
    images[image.spid] = image;
  }
  for (const image of getRtfImagesByType(rtf, 's', String.raw`\shp`)) {
    images[image.spid] = image;
  }

  return images;
};

const getVShapes = (document: Document): Record<string, string> =>
  getHtmlComments(document).reduce<Record<string, string>>(
    (shapes, comment) => {
      for (const shapeTag of comment.match(V_SHAPE_OPEN_TAG) ?? []) {
        const id = V_SHAPE_ID.exec(shapeTag)?.[1];
        const spid = V_SHAPE_SPID.exec(shapeTag)?.[1];

        if (id && spid) shapes[id] = spid;
      }

      return shapes;
    },
    {}
  );

const getVShapeSpid = (document: Document, element: Element): string | null => {
  const normalize = (spid: string) => spid.split('_')[2];

  if (element.tagName === 'IMG') {
    const vShapeId = element.getAttribute('v:shapes');

    if (!vShapeId) return null;

    const vShapeSpid = getVShapes(document)[vShapeId];

    if (vShapeSpid) return normalize(vShapeSpid);
    if (
      element.parentElement?.parentElement?.innerHTML.includes('msEquation')
    ) {
      return null;
    }

    return normalize(vShapeId);
  }
  if (!element.parentElement) return null;

  const spid = element.parentElement.getAttribute('o:spid');

  return spid ? normalize(spid) : null;
};

const cleanDocxImageElements = (
  document: Document,
  rtf: string,
  rootNode: Node
): void => {
  if (!rtf) return;

  const rtfImagesMap = getRtfImagesMap(rtf);

  traverseHtmlElements(rootNode, (element) => {
    if (!['IMG', 'V:IMAGEDATA'].includes(element.tagName)) return true;

    if (element.tagName === 'IMG') {
      const src = element.getAttribute('src');

      if (!src?.startsWith('file://')) return true;

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

    if (!vShapeSpid) return true;

    const rtfImage = rtfImagesMap[vShapeSpid];

    if (!rtfImage) {
      element.remove();

      return true;
    }

    const pairs = rtfImage.hex.match(/\w{2}/g) ?? [];
    const binary = pairs.map((pair) =>
      String.fromCodePoint(Number.parseInt(pair, 16))
    );
    const dataUri = `data:${rtfImage.mimeType};base64,${btoa(binary.join(''))}`;

    if (element.tagName === 'IMG') {
      element.setAttribute('src', dataUri);
    } else if (element.parentNode?.parentNode) {
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

export const isDocxContent = (body: HTMLElement): boolean => {
  let result = false;

  traverseHtmlElements(body, (element) => {
    const style = element.getAttribute('style') ?? '';

    result =
      result ||
      style.includes('mso-') ||
      Array.from(element.classList).some((className) =>
        className.startsWith('Mso')
      );

    return !result;
  });

  return result;
};

const cleanDocxFootnotes = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (
      element.tagName === 'SPAN' &&
      element.classList.contains('MsoFootnoteReference')
    ) {
      const replacement = element.ownerDocument.createElement('sup');

      replacement.textContent = (element.textContent ?? '')
        .trim()
        .replaceAll(/[[\]]/g, '');
      element.replaceWith(replacement);
    }

    return true;
  });
};

const cleanDocxEmptyParagraphs = (rootNode: Node): void => {
  const isEmpty = (element: Element): boolean =>
    element.children.length === 1 &&
    element.firstElementChild !== null &&
    ((element.firstElementChild.nodeName === 'O:P' &&
      element.firstElementChild.textContent === '\u00A0') ||
      isEmpty(element.firstElementChild));

  traverseHtmlElements(rootNode, (element) => {
    if (element.tagName === 'P' && isEmpty(element)) element.innerHTML = '';

    return true;
  });
};

const cleanDocxQuotes = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (
      element.parentNode &&
      element.tagName === 'P' &&
      element.classList.contains('MsoQuote')
    ) {
      replaceTagName(element, 'blockquote');
    }

    return true;
  });
};

const cleanDocxSpans = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (element.nodeName !== 'SPAN') return true;

    const style = element.getAttribute('style') ?? '';

    if (['mso-spacerun: yes', 'mso-spacerun:yes'].includes(style)) {
      element.replaceWith(
        element.ownerDocument.createTextNode(
          ' '.repeat((element.textContent ?? '').length)
        )
      );

      return true;
    }
    if (style.startsWith('mso-tab-count:')) {
      const [, count = '0'] = style.split(':');

      element.replaceWith(
        element.ownerDocument.createTextNode(
          '\t'.repeat(Number.parseInt(count, 10))
        )
      );
    }

    return true;
  });
};

const cleanDocxBrComments = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    if (
      element.tagName === 'BR' &&
      element.nextSibling &&
      isHtmlComment(element.nextSibling) &&
      element.nextSibling.data === '[if !supportLineBreakNewLine]'
    ) {
      removeHtmlNodesBetweenComments(
        element.nextSibling,
        '[if !supportLineBreakNewLine]',
        '[endif]'
      );
    }

    return element.tagName !== 'BR';
  });
};

const cleanDocxListElements = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    const style = element.getAttribute('style');

    if (style) {
      element.setAttribute(
        'style',
        style.replaceAll(/mso-list:\s*ignore/gi, 'mso-list:Ignore')
      );
    }

    return true;
  });
};

export const cleanDocx = (html: string, rtf: string): string => {
  const endIndex = html.lastIndexOf('</html>');
  const withoutTrailing =
    endIndex === -1 ? html : html.slice(0, endIndex + '</html>'.length);
  const startIndex = withoutTrailing.indexOf('<html');
  const normalizedHtml = (
    startIndex === -1 ? withoutTrailing : withoutTrailing.slice(startIndex)
  ).replaceAll(/\r\n|\r/g, '\n');
  const document = new DOMParser().parseFromString(normalizedHtml, 'text/html');
  const { body } = document;

  if (!rtf && !isDocxContent(body)) {
    return html;
  }

  cleanDocxFootnotes(body);
  cleanDocxImageElements(document, rtf, body);

  {
    const allowedEmptyElements = new Set(['BR', 'IMG', 'TD', 'TH']);
    const removeIfEmpty = (element: Element): void => {
      if (
        allowedEmptyElements.has(element.nodeName) ||
        element.innerHTML.trim()
      ) {
        return;
      }

      const { parentElement } = element;

      element.remove();
      if (parentElement) removeIfEmpty(parentElement);
    };

    traverseHtmlElements(body, (element) => {
      removeIfEmpty(element);

      return true;
    });
  }

  cleanDocxEmptyParagraphs(body);
  cleanDocxQuotes(body);
  cleanDocxSpans(body);

  traverseHtmlNode(body, (node) => {
    if (!isHtmlText(node)) return true;
    if (
      node.data.startsWith('\n') &&
      node.data.trim().length === 0 &&
      (node.previousElementSibling || node.nextElementSibling)
    ) {
      node.remove();

      return true;
    }

    node.data = node.data.replaceAll(/\n\s*/g, '\n');

    if (
      node.data.includes('\r') ||
      node.data.includes('\n') ||
      node.data.includes('\u00A0')
    ) {
      const hasSpace = node.data.includes(' ');
      const hasNonWhitespace = node.data.trim().length > 0;
      const hasLineFeed = node.data.includes('\n');

      if (!(hasSpace || hasNonWhitespace) && !hasLineFeed) {
        if (node.data === '\u00A0') {
          node.data = ' ';

          return true;
        }

        node.remove();

        return true;
      }
      if (node.previousSibling?.nodeName === 'BR' && node.parentElement) {
        node.previousSibling.remove();

        let offset = 0;

        while (node.data[offset] === '\n' || node.data[offset] === '\r') {
          offset++;
        }

        node.data = node.data
          .slice(Math.max(0, offset))
          .replaceAll('\n', ' ')
          .replaceAll('\r', ' ');
        node.data = `\n${node.data}`;
      } else {
        node.data = node.data.replaceAll('\n', ' ').replaceAll('\r', ' ');
      }
    }

    return true;
  });

  cleanDocxBrComments(body);

  traverseHtmlElements(body, (element) => {
    if (element.tagName !== 'BR') return true;

    element.parentElement?.replaceChild(document.createTextNode('\n'), element);

    return false;
  });

  traverseHtmlElements(body, (element) => {
    if (element.tagName !== 'A') return true;

    const href = element.getAttribute('href');

    if (!href || href.startsWith('#')) {
      element.outerHTML = element.innerHTML;
    }
    if (href && element.querySelector('img')) {
      for (const span of element.querySelectorAll('span')) {
        if (!span.textContent) span.outerHTML = span.innerHTML;
      }
    }

    return true;
  });

  traverseHtmlElements(body, (element) => {
    if (element.tagName !== 'FONT') return true;

    if (element.textContent) {
      replaceTagName(element, 'span');
    } else {
      element.remove();
    }

    return true;
  });

  cleanDocxListElements(body);

  traverseHtmlElements(body, (element) => {
    const htmlElement = element as HTMLElement;

    if (
      !element.hasAttribute('style') ||
      !isHtmlBlockElement(htmlElement) ||
      htmlElement.nodeName === 'TABLE'
    ) {
      return true;
    }

    const {
      style: {
        backgroundColor,
        color,
        fontFamily,
        fontSize,
        fontStyle,
        fontWeight,
        textDecoration,
      },
    } = htmlElement;

    if (
      !backgroundColor &&
      !color &&
      !fontFamily &&
      !fontSize &&
      !fontStyle &&
      !fontWeight &&
      !textDecoration
    ) {
      return true;
    }

    const span = document.createElement('span');

    if (!['inherit', 'initial'].includes(color)) span.style.color = color;

    span.style.fontFamily = fontFamily;
    span.style.fontSize = fontSize;

    if (!['inherit', 'initial', 'normal'].includes(color)) {
      span.style.fontStyle = fontStyle;
    }
    if (![400, 'normal'].includes(fontWeight)) {
      span.style.fontWeight = fontWeight;
    }

    span.style.textDecoration = textDecoration;
    span.innerHTML = htmlElement.innerHTML;
    element.innerHTML = span.outerHTML;

    return true;
  });

  // Preserve whitespace during HTML decoding.
  const preformattedWrapper = document.createElement('div');
  preformattedWrapper.style.whiteSpace = 'pre-wrap';
  preformattedWrapper.innerHTML = body.innerHTML;

  return postCleanHtml(preformattedWrapper.outerHTML);
};
