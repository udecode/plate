import { render, waitFor } from '@testing-library/react';
import React from 'react';

import { getCompiledPlatePlugin } from '../../internal/plugin/compilePlateModel';
import { brandPluginDescriptor } from '../../internal/utils/mergePlugins';
import { createEditor } from '../editor';
import {
  PlateRenderedAttributeProvider,
  usePlateRenderedAttributes,
} from '../internal/rendered-attributes';
import { definePlatePlugin } from '../plugin';
import type { AnyResolvedPlatePlugin } from '../plugin/PlatePlugin';
import { useEditorMounted } from '../stores';
import { ViewElementAttributesEffect } from './EditorRefEffect';
import { Plate } from './Plate';
import { PlateContent } from './PlateContent';

describe('EditorRefEffect', () => {
  it('remounts changed view-attribute hooks and clears their publication', async () => {
    const events: string[] = [];
    const AttributesPlugin = definePlatePlugin('attributeReplacement', {
      render: {
        useViewElementAttributes: ({ view }) => {
          React.useLayoutEffect(() => {
            events.push('first mount');

            return () => {
              events.push('first cleanup');
            };
          }, []);

          const key = view.key([0]);

          return key ? [{ key, attributes: { 'data-owner': 'first' } }] : [];
        },
      },
    });
    const editor = createEditor({ plugins: [AttributesPlugin] });
    const plugin = getCompiledPlatePlugin(
      editor,
      AttributesPlugin
    ) as unknown as AnyResolvedPlatePlugin;
    const replacement = brandPluginDescriptor(
      {
        ...plugin,
        render: {
          ...plugin.render,
          useViewElementAttributes: () => {
            const [owner] = React.useState('second');

            React.useLayoutEffect(() => {
              events.push('second mount');

              return () => {
                events.push('second cleanup');
              };
            }, []);

            const key = editor.key([0]);

            return key ? [{ key, attributes: { 'data-owner': owner } }] : [];
          },
        },
      },
      plugin
    ) as AnyResolvedPlatePlugin;

    function AttributeSnapshot() {
      const attributes = usePlateRenderedAttributes(editor.key([0]));

      return <output>{JSON.stringify(attributes)}</output>;
    }

    const tree = (current: AnyResolvedPlatePlugin | null) => (
      <Plate editor={editor}>
        <PlateRenderedAttributeProvider>
          {current && (
            <ViewElementAttributesEffect plugin={current} sourceOrder={0} />
          )}
          <AttributeSnapshot />
        </PlateRenderedAttributeProvider>
      </Plate>
    );
    const mounted = render(tree(plugin));

    await waitFor(() => {
      expect(events).toEqual(['first mount']);
      expect(mounted.container.querySelector('output')?.textContent).toBe(
        '{"data-owner":"first"}'
      );
    });

    mounted.rerender(tree(brandPluginDescriptor({ ...plugin }, plugin)));
    expect(events).toEqual(['first mount']);

    mounted.rerender(tree(replacement));
    await waitFor(() => {
      expect(events).toEqual(['first mount', 'first cleanup', 'second mount']);
      expect(mounted.container.querySelector('output')?.textContent).toBe(
        '{"data-owner":"second"}'
      );
    });

    mounted.rerender(tree(null));
    expect(events).toEqual([
      'first mount',
      'first cleanup',
      'second mount',
      'second cleanup',
    ]);
    expect(mounted.container.querySelector('output')?.textContent).toBe('{}');
  });

  it('publishes mounted state for the content lifetime under StrictMode', () => {
    const editor = createEditor();
    const replacement = createEditor();

    function MountedState() {
      return <output>{String(useEditorMounted())}</output>;
    }

    const tree = (current: typeof editor, showContent: boolean) => (
      <React.StrictMode>
        <Plate editor={current}>
          <MountedState />
          {showContent && <PlateContent />}
        </Plate>
      </React.StrictMode>
    );
    const mounted = render(tree(editor, false));

    expect(mounted.container.querySelector('output')?.textContent).toBe(
      'false'
    );
    mounted.rerender(tree(editor, true));
    expect(mounted.container.querySelector('output')?.textContent).toBe('true');
    mounted.rerender(tree(replacement, true));
    expect(mounted.container.querySelector('output')?.textContent).toBe('true');
    mounted.rerender(tree(replacement, false));
    expect(mounted.container.querySelector('output')?.textContent).toBe(
      'false'
    );
  });

  it('keeps a shared Plate store mounted until its last content unmounts', () => {
    const editor = createEditor();

    function MountedState() {
      return <output>{String(useEditorMounted())}</output>;
    }

    const tree = (first: boolean, second: boolean) => (
      <React.StrictMode>
        <Plate editor={editor} suppressInstanceWarning>
          <MountedState />
          {first && <PlateContent data-testid="first-content" />}
          {second && <PlateContent data-testid="second-content" />}
        </Plate>
      </React.StrictMode>
    );
    const mounted = render(tree(true, true));

    expect(mounted.container.querySelector('output')?.textContent).toBe('true');
    mounted.rerender(tree(false, true));
    expect(mounted.queryByTestId('first-content')).toBeNull();
    expect(mounted.queryByTestId('second-content')).not.toBeNull();
    expect(mounted.container.querySelector('output')?.textContent).toBe('true');
    mounted.rerender(tree(true, true));
    mounted.rerender(tree(true, false));
    expect(mounted.container.querySelector('output')?.textContent).toBe('true');
    mounted.rerender(tree(false, false));
    expect(mounted.container.querySelector('output')?.textContent).toBe(
      'false'
    );
  });
});
