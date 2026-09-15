import { act, render, renderHook } from '@testing-library/react';
import React from 'react';

import { TestPlate as EditorRoot } from '../../__tests__/TestPlate';
import { EditorContent } from '../../components/PlateContent';
import { createEditor } from '../../editor';
import { definePlugin } from '../../plugin';
import { useEditor } from './useEditor';

describe('useEditor plugin portal', () => {
  it('binds staged APIs to the mounted editor while keeping the plugin store shared', () => {
    const OwnerPlugin = definePlugin('mountedOwner', {
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
    const portals: Array<ReturnType<typeof editor.plugin<typeof OwnerPlugin>>> =
      [];
    function Capture({ index }: { index: number }) {
      const view = useEditor();
      const portal = view.plugin(OwnerPlugin);
      React.useLayoutEffect(() => {
        owners[index] = view;
        portals[index] = portal;
      }, [index, portal, view]);
      return <EditorContent aria-label={`owner-${index}`} />;
    }
    const rendered = render(
      <>
        <EditorRoot editor={editor}>
          <Capture index={0} />
        </EditorRoot>
        <EditorRoot editor={editor}>
          <Capture index={1} />
        </EditorRoot>
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
    const BlockPlugin = definePlugin('block', {
      update: () => ({ duplicate }),
    });
    const editor = createEditor({ plugins: [BlockPlugin] });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <EditorRoot editor={editor}>{children}</EditorRoot>
    );
    const { result } = renderHook(() => useEditor().plugin(BlockPlugin), {
      wrapper: Wrapper,
    });

    void act(() => result.current.update.duplicate());

    expect(duplicate).toHaveBeenCalledTimes(1);
  });

  it('returns the flat plugin portal with a stable store-backed reference', () => {
    const CounterPlugin = definePlugin('counter', {
      initialState: {
        value: 1,
      },
    });
    const editor = createEditor({
      plugins: [CounterPlugin],
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <EditorRoot editor={editor}>{children}</EditorRoot>
    );

    const { result, rerender } = renderHook(
      () => useEditor().plugin(CounterPlugin),
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

  it('reports an absent nominal descriptor without weakening capability errors', () => {
    const CounterPlugin = definePlugin('counter', {});
    const MissingPlugin = definePlugin('missing', {});
    const editor = createEditor({ plugins: [CounterPlugin] });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <EditorRoot editor={editor}>{children}</EditorRoot>
    );
    const { result: installed } = renderHook(
      () => useEditor().plugin(CounterPlugin),
      { wrapper: Wrapper }
    );
    const { result: missing } = renderHook(
      () => useEditor().plugin(MissingPlugin),
      { wrapper: Wrapper }
    );

    expect(installed.current.installed).toBe(true);
    expect(installed.current.name).toBe('counter');
    expect(missing.current.installed).toBe(false);
    expect(() => missing.current.name).toThrow(
      'Plate plugin "missing" is not installed.'
    );
  });
});
