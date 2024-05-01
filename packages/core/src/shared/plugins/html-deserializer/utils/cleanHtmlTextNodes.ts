import {
  CARRIAGE_RETURN,
  LINE_FEED,
  NO_BREAK_SPACE,
  SPACE,
} from '../constants';
import { traverseHtmlTexts } from './traverseHtmlTexts';

export const cleanHtmlTextNodes = (rootNode: Node): void => {
  traverseHtmlTexts(rootNode, (textNode) => {
    if (
      /^\n\s*$/.test(textNode.data) &&
      (textNode.previousElementSibling || textNode.nextElementSibling)
    ) {
      textNode.remove();

      return true;
    }

    textNode.data = textNode.data.replaceAll(/\n\s*/g, '\n');

    if (
      textNode.data.includes(CARRIAGE_RETURN) ||
      textNode.data.includes(LINE_FEED) ||
      textNode.data.includes(NO_BREAK_SPACE)
    ) {
      const hasSpace = textNode.data.includes(SPACE);
      const hasNonWhitespace = /\S/.test(textNode.data);
      const hasLineFeed = textNode.data.includes(LINE_FEED);

      if (!(hasSpace || hasNonWhitespace) && !hasLineFeed) {
        if (textNode.data === NO_BREAK_SPACE) {
          textNode.data = SPACE;
          return true;
        }

        textNode.remove();

        return true;
      }

      if (
        textNode.previousSibling &&
        textNode.previousSibling.nodeName === 'BR' &&
        textNode.parentElement
      ) {
        textNode.previousSibling.remove();

        const matches = textNode.data.match(/^[\n\r]+/);
        const offset = matches ? matches[0].length : 0;

        textNode.data = textNode.data
          .slice(Math.max(0, offset))
          .replaceAll(new RegExp(LINE_FEED, 'g'), SPACE)
          .replaceAll(new RegExp(CARRIAGE_RETURN, 'g'), SPACE);
        textNode.data = `\n${textNode.data}`;
      } else {
        textNode.data = textNode.data
          .replaceAll(new RegExp(LINE_FEED, 'g'), SPACE)
          .replaceAll(new RegExp(CARRIAGE_RETURN, 'g'), SPACE);
      }
    }

    return true;
  });
};
