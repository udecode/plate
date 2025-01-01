import {
  type HtmlDeserializer,
  getSlateElements,
  isPluginStatic,
} from '@udecode/plate-common';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
} from '../BaseCodeBlockPlugin';

export const rulesStaticCodeBlock: HtmlDeserializer['rules'] = [
  {
    validClassName: 'slate-code_block',
    validNodeName: 'DIV',
  },
];

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
          children: [{ text: line.textContent }],
          type: BaseCodeLinePlugin.key,
        };
      });

      return {
        children: codeLines,
        lang,
        type: BaseCodeBlockPlugin.key,
      };
    }
  }
};
