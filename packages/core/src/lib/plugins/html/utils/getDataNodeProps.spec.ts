import { schema } from '@platejs/plite';

import { createBaseEditor, createBasePlugin } from '../../../index';
import { getDataNodeProps } from './getDataNodeProps';

const paragraphElement = {
  content: schema.content.text({ default: 'text', min: 1 }),
  groups: ['block'],
} as const;

describe('getDataNodeProps', () => {
  it('parses default Plite data attributes and merges custom node props', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      node: { element: paragraphElement, type: 'p' },
      parsers: {
        html: {
          deserializer: {
            toNodeProps: () => ({
              custom: 'yes',
              fontSize: 14,
            }),
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin],
    });
    const element = document.createElement('p');

    element.className = 'plite-p';
    element.dataset.pliteNode = 'element';
    element.dataset.pliteChecked = 'true';
    element.dataset.pliteFontSize = '12';
    element.dataset.pliteLevel = '3';

    expect(
      getDataNodeProps({
        editor,
        element,
        plugin: editor.getPlugin(ParagraphPlugin),
      })
    ).toEqual({
      checked: true,
      custom: 'yes',
      fontSize: 14,
      level: 3,
    });
  });

  it('respects disableDefaultNodeProps and skips non-Plite nodes', () => {
    const DisabledPlugin = createBasePlugin({
      key: 'p',
      node: { element: paragraphElement, type: 'p' },
      parsers: {
        html: {
          deserializer: {
            disableDefaultNodeProps: true,
            toNodeProps: () => ({
              custom: 'only',
            }),
          },
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [DisabledPlugin],
    });
    const pliteElement = document.createElement('p');
    const plainElement = document.createElement('p');

    pliteElement.className = 'plite-p';
    pliteElement.dataset.pliteNode = 'element';
    pliteElement.dataset.pliteLevel = '2';

    expect(
      getDataNodeProps({
        editor,
        element: pliteElement,
        plugin: editor.getPlugin(DisabledPlugin),
      })
    ).toEqual({ custom: 'only' });
    expect(
      getDataNodeProps({
        editor,
        element: plainElement,
        plugin: editor.getPlugin(DisabledPlugin),
      })
    ).toEqual({ custom: 'only' });
  });

  it('returns undefined when no default or custom node props apply', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      node: { element: paragraphElement, type: 'p' },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin],
    });

    expect(
      getDataNodeProps({
        editor,
        element: document.createElement('p'),
        plugin: editor.getPlugin(ParagraphPlugin),
      })
    ).toBeUndefined();
  });
});
