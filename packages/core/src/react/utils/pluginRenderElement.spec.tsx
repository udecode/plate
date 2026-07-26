/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { property, schema, target, type Element } from '@platejs/plite';
import { render } from '@testing-library/react';

import { createBasePlugin } from '../../lib';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import { PlateRoot } from '../components/PlateRoot';
import { createPlateEditor } from '../editor/withPlate';
import { createPlatePlugin } from '../plugin/createPlatePlugin';
import { useElement } from '../stores/element/useElement';
import { pluginRenderElement } from './pluginRenderElement';

const createValue = () =>
  [
    {
      children: [{ text: 'Body' }],
      marker: 'yes',
      type: 'p',
    },
  ] as any;

const MarkerPlugin = createBasePlugin({
  key: 'marker',
  schema: {
    properties: [
      schema.elementProperty('marker', property.string(), {
        target: target.type('p'),
      }),
    ],
  },
});

const renderPlugin = (editor: ReturnType<typeof createPlateEditor>) => {
  const element = editor.read.children()[0] as any;
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
      <PlateRoot>
        <RenderProbe />
      </PlateRoot>
    </Plate>
  );
};

describe('pluginRenderElement', () => {
  it('renders the default paragraph element with the paragraph plugin class', () => {
    const editor = createPlateEditor({
      plugins: [MarkerPlugin],
      initialValue: createValue(),
    });

    const { container } = renderPlugin(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('plite-p');
  });

  it('keeps element context available for custom node components', () => {
    const editor = createPlateEditor({
      plugins: [
        MarkerPlugin,
        createPlatePlugin({
          component: ({ attributes, children }) => {
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
          key: 'p',
          type: 'p',
          schema: {
            element: {
              content: schema.content.open({ default: 'text', min: 1 }),
            },
          },
        }),
      ],
      initialValue: createValue(),
    });

    const { getByTestId } = renderPlugin(editor);

    expect(getByTestId('paragraph')).toHaveAttribute('data-marker', 'yes');
  });

  it('passes each wrapper its own plugin API', () => {
    const WrapperPlugin = createBasePlugin({
      key: 'wrapper',
      api: {
        isMarked: (element: Element) => element.marker === 'yes',
      },
    }).extend({
      render: {
        belowNodes: ({ api, element }) =>
          api.isMarked(element)
            ? ({ children }) => (
                <section data-testid="wrapper">{children}</section>
              )
            : undefined,
      },
    });
    const editor = createPlateEditor({
      plugins: [MarkerPlugin, WrapperPlugin],
      initialValue: createValue(),
    });

    const { getByTestId } = renderPlugin(editor);

    expect(getByTestId('wrapper')).toHaveTextContent('Body');
  });

  it('preserves Plite children for void render.as tags', () => {
    const editor = createPlateEditor({
      plugins: [
        createBasePlugin({
          key: 'hr',
          type: 'hr',
          schema: { element: { void: 'block' } },
          render: {
            as: 'hr',
          },
        }),
      ],
      initialValue: [
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
