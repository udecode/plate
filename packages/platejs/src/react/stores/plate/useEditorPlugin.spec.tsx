import { act, render, renderHook } from '@testing-library/react';
import React from 'react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { PlateContent } from '../../components/PlateContent';
import { createEditor } from '../../editor';
import { definePlatePlugin } from '../../plugin';
import { useEditor } from './useEditor';
import { useEditorPlugin } from './useEditorPlugin';

describe('useEditorPlugin', () => {
  it('binds staged APIs to the mounted editor while keeping the plugin store shared', () => {
    const OwnerPlugin = definePlatePlugin('mountedOwner', {
      initialState: { count: 0 },
      api: ({ editor, store }) => ({
        owner: () => editor,
        label: () => 'base',
        count: () => store.get('count'),
      }),
    }).extend({
      api: ({ api }) => ({ label: () => `${api.label()}:extended` }),
    });
    const editor = createEditor({ plugins: [OwnerPlugin] });
    const owners: Array<ReturnType<typeof useEditor>> = [];
    const portals: Array<
      ReturnType<typeof useEditorPlugin<typeof OwnerPlugin>>
    > = [];
    function Capture({ index }: { index: number }) {
      const view = useEditor();
      const portal = useEditorPlugin(OwnerPlugin);
      React.useLayoutEffect(() => {
        owners[index] = view;
        portals[index] = portal;
      }, [index, portal, view]);
      return <PlateContent aria-label={`owner-${index}`} />;
    }
    const rendered = render(
      <>
        <Plate editor={editor}>
          <Capture index={0} />
        </Plate>
        <Plate editor={editor}>
          <Capture index={1} />
        </Plate>
      </>
    );

    expect(owners[0]).not.toBe(owners[1]);
    for (const [index, portal] of portals.entries()) {
      expect(portal.api.owner()).toBe(owners[index]);
      expect(portal.api.label()).toBe('base:extended');
      expect(portal.api).toBe(owners[index].api.mountedOwner);
      expect(portal.api.owner().api.dom.root()).toBe(
        rendered.getByRole('textbox', { name: `owner-${index}` })
      );
    }
    act(() => editor.plugin(OwnerPlugin).store.set({ count: 2 }));
    expect(portals.map((portal) => portal.api.count())).toEqual([2, 2]);
    expect(editor.plugin(OwnerPlugin).api.owner()).toBe(editor);
    rendered.unmount();
    expect(portals[0].api.owner().api.dom.root()).toBeNull();
  });

  it('infers plugin-owned updates from the descriptor', () => {
    const duplicate = vi.fn();
    const BlockPlugin = definePlatePlugin('block', {
      update: () => ({ duplicate }),
    });
    const editor = createEditor({ plugins: [BlockPlugin] });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const { result } = renderHook(() => useEditorPlugin(BlockPlugin), {
      wrapper: Wrapper,
    });

    void act(() => result.current.update.duplicate());

    expect(duplicate).toHaveBeenCalledTimes(1);
  });

  it('returns the flat plugin portal with a stable store-backed reference', () => {
    const CounterPlugin = definePlatePlugin('counter', {
      initialState: {
        value: 1,
      },
    });
    const editor = createEditor({
      plugins: [CounterPlugin],
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );

    const { result, rerender } = renderHook(
      () => useEditorPlugin(CounterPlugin),
      {
        wrapper: Wrapper,
      }
    );

    const firstPortal = result.current;

    expect(firstPortal.name).toBe('counter');
    expect(firstPortal.store.get()).toEqual({ value: 1 });
    expect(firstPortal.store).toBeDefined();
    expect('plugin' in firstPortal).toBe(false);
    expect('editor' in firstPortal).toBe(false);
    expect('defineCodecs' in firstPortal).toBe(false);

    rerender();
    expect(result.current).toBe(firstPortal);

    act(() => {
      editor.plugin(CounterPlugin).store.set({ value: 2 });
    });

    expect(result.current.store.get()).toEqual({ value: 2 });
  });

  it('accepts runtime names without weakening missing-plugin errors', () => {
    const CounterPlugin = definePlatePlugin('counter', {});
    const editor = createEditor({ plugins: [CounterPlugin] });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const { result: installed } = renderHook(() => useEditorPlugin('counter'), {
      wrapper: Wrapper,
    });
    const { result: missing } = renderHook(() => useEditorPlugin('missing'), {
      wrapper: Wrapper,
    });

    expect(installed.current.installed).toBe(true);
    expect(installed.current.name).toBe('counter');
    expect(missing.current.installed).toBe(false);
    expect(() => missing.current.name).toThrow(
      'Plate plugin "missing" is not installed.'
    );

    const weakNameReference = { name: 'counter' } as const;
    const useAssertWeakNameObjectRejected = () => {
      // @ts-expect-error Weak name objects are not public hook inputs.
      useEditorPlugin(weakNameReference);
    };
    void useAssertWeakNameObjectRejected;
  });
});
