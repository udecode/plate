import { getSlateElements, isSlatePluginElement } from '@udecode/plate';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
} from '../BaseCodeBlockPlugin';

export const htmlDeserializerCodeBlockStatic = (element: HTMLElement) => {
  if (isSlatePluginElement(element, BaseCodeBlockPlugin.key)) {
    const staticCodeLines = getSlateElements(element).filter((el) =>
      isSlatePluginElement(el, BaseCodeLinePlugin.key)
    );

    if (staticCodeLines) {
      const codeLines = staticCodeLines.map((line) => {
        const node: any = {
          children: [{ text: line.textContent }],
          type: BaseCodeLinePlugin.key,
        };

        if (line.dataset.slateId) {
          node.id = line.dataset.slateId;
        }

        return node;
      });

      return {
        children: codeLines,
        type: BaseCodeBlockPlugin.key,
      };
    }
  }
};
