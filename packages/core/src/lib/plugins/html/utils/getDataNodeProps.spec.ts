import { createSlateEditor, createSlatePlugin } from '../../../index';
import { getDataNodeProps } from './getDataNodeProps';

describe('getDataNodeProps', () => {
  it('parses default slate data attributes and merges custom node props', () => {
    const ParagraphPlugin = createSlatePlugin({
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
    const editor = createSlateEditor({
      plugins: [ParagraphPlugin],
    });
    const element = document.createElement('p');

    element.className = 'slate-p';
    element.dataset.slateNode = 'element';
    element.dataset.slateChecked = 'true';
    element.dataset.slateFontSize = '12';
    element.dataset.slateLevel = '3';

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

  it('respects disableDefaultNodeProps and skips non-slate nodes', () => {
    const DisabledPlugin = createSlatePlugin({
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
    const editor = createSlateEditor({
      plugins: [DisabledPlugin],
    });
    const slateElement = document.createElement('p');
    const plainElement = document.createElement('p');

    slateElement.className = 'slate-p';
    slateElement.dataset.slateNode = 'element';
    slateElement.dataset.slateLevel = '2';

    expect(
      getDataNodeProps({
        editor,
        element: slateElement,
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
});
