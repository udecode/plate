import { createBasePlateEditor, createEditorPlugin } from '../../../index';
import { getDataNodeProps } from './getDataNodeProps';

describe('getDataNodeProps', () => {
  it('parses default Plite data attributes and merges custom node props', () => {
    const ParagraphPlugin = createEditorPlugin({
      key: 'p',
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
    const editor = createBasePlateEditor({
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
    const DisabledPlugin = createEditorPlugin({
      key: 'p',
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
    const editor = createBasePlateEditor({
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
    const ParagraphPlugin = createEditorPlugin({
      key: 'p',
    });
    const editor = createBasePlateEditor({
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
