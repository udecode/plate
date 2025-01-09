import { getSlateElements, isPluginStatic } from '@udecode/plate-common';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
} from '../BaseCodeBlockPlugin';

export const htmlDeserializerCodeBlockStatic = (element: HTMLElement) => {
  if (isPluginStatic(element, BaseCodeBlockPlugin.key)) {
    const languageClass = Array.from(element.classList).find((className) =>
      className.startsWith('language-')
    );

    const lang = languageClass?.replace('language-', '');

    const staticCodeLines = getSlateElements(element).filter((el) =>
      isPluginStatic(el, BaseCodeLinePlugin.key)
    );

    if (staticCodeLines) {
      const codeLines = staticCodeLines.map((line) => {
        return {
          type: BaseCodeLinePlugin.key,
          // eslint-disable-next-line perfectionist/sort-objects
          children: [{ text: line.textContent }],
        };
      });

      return {
        type: BaseCodeBlockPlugin.key,
        // eslint-disable-next-line perfectionist/sort-objects
        lang,
        // eslint-disable-next-line perfectionist/sort-objects
        children: codeLines,
      };
    }
  }
};
