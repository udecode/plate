import type { Element } from '@platejs/plite';
import { NodeApi } from '@platejs/plite';

import type { BaseEditor } from '../../editor';
import type { PluginConfig } from '../../plugin';

import { createBasePlugin } from '../../plugin';

const isElementStateIgnoredProp = (
  editor: BaseEditor,
  element: Element,
  key: string
) => {
  if (key === 'type') return true;

  if (typeof element.type !== 'string') return false;

  return (
    editor.read.schema.property({
      key,
      placement: 'element',
      type: element.type,
    })?.value.significant === false
  );
};

export const isElementStateEmpty = (
  editor: BaseEditor,
  element: Element
): boolean =>
  !NodeApi.hasProps(element, {
    ignore: (key) => isElementStateIgnoredProp(editor, element, key),
  });

export type ElementStateConfig = PluginConfig<
  'elementState',
  {},
  {
    isElementStateEmpty: (element: Element) => boolean;
  }
>;

export const ElementStatePlugin = createBasePlugin<ElementStateConfig>({
  extension: ({ editor }) => ({
    api: {
      isElementStateEmpty: (element) => isElementStateEmpty(editor, element),
    },
  }),
  key: 'elementState',
});
