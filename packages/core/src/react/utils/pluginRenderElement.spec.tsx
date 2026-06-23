/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { render } from '@testing-library/react';

import { createEditorPlugin } from '../../lib';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import { Plite } from '../components/Plite';
import { createPlateEditor } from '../editor/withPlate';
import { useElement } from '../stores/element/useElement';
import { pluginRenderElement } from './pluginRenderElement';

const createTestPlateEditor = (options: any) => createPlateEditor(options);

const createValue = () =>
  [
    {
      children: [{ text: 'Body' }],
      marker: 'yes',
      type: 'p',
    },
  ] as any;

const renderPlugin = (editor: ReturnType<typeof createPlateEditor>) => {
  const element = editor.children[0] as any;
  const plugin = editor.getPlugin({ key: element.type })!;
  const renderElement = pluginRenderElement(editor, plugin as any);

  const RenderProbe = () =>
    renderElement({
      attributes: {} as any,
      children: 'Body',
      element,
      path: [0],
    } as any);

  return render(
    <Plate editor={editor}>
      <Plite>
        <RenderProbe />
      </Plite>
    </Plate>
  );
};

describe('pluginRenderElement', () => {
  it('renders the default paragraph element with the paragraph plugin class', () => {
    const editor = createTestPlateEditor({
      plugins: [],
      value: createValue(),
    });

    const { container } = renderPlugin(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('plite-p');
  });

  it('keeps element context available for custom node components', () => {
    const editor = createTestPlateEditor({
      plugins: [
        createEditorPlugin({
          key: 'p',
          node: {
            isElement: true,
            type: 'p',
          },
          render: {
            node: ({ attributes, children }) => {
              const element = useElement<any>();

              return (
                <p
                  {...attributes}
                  data-marker={element.marker}
                  data-testid="paragraph"
                >
                  {children}
                </p>
              );
            },
          },
        }),
      ],
      value: createValue(),
    });

    const { getByTestId } = renderPlugin(editor);

    expect(getByTestId('paragraph')).toHaveAttribute('data-marker', 'yes');
  });

  it('preserves Plite children for void render.as tags', () => {
    const editor = createTestPlateEditor({
      plugins: [
        createEditorPlugin({
          key: 'hr',
          node: {
            isElement: true,
            isVoid: true,
            type: 'hr',
          },
          render: {
            as: 'hr',
          },
        }),
      ],
      value: [
        {
          children: [{ text: '' }],
          type: 'hr',
        },
      ] as any,
    });

    const { container } = renderPlugin(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element?.tagName).toBe('DIV');
    expect(
      element?.querySelector('hr[contenteditable="false"]')
    ).toBeInTheDocument();
    expect(element).toHaveTextContent('Body');
  });
});
