import { act, render } from '@testing-library/react';
import React from 'react';

import { createEditorView } from '../../../facade';
import { EditorProvider } from '../../components/EditorProvider';
import { createEditor } from '../../editor';
import { definePlugin } from '../../plugin';
import { useViewStore } from './useViewStore';

describe('useViewStore', () => {
  it("re-renders only the writing view's subscriber", () => {
    const OpenPlugin = definePlugin('open', {
      initialViewState: () => ({ open: false }),
    });
    const editor = createEditor({ plugins: [OpenPlugin] });
    const first = createEditorView(editor);
    const second = createEditorView(editor);
    const calls = {
      first: { renders: mock(), selects: mock(), shown: mock() },
      second: { renders: mock(), selects: mock(), shown: mock() },
    };

    const Open = ({ name }: { name: 'first' | 'second' }) => {
      calls[name].renders();
      calls[name].shown(
        useViewStore(OpenPlugin, (state) => {
          calls[name].selects();

          return state.open;
        })
      );

      return null;
    };

    render(
      <>
        <EditorProvider editor={first}>
          <Open name="first" />
        </EditorProvider>
        <EditorProvider editor={second}>
          <Open name="second" />
        </EditorProvider>
      </>
    );
    const count = () => ({
      firstRenders: calls.first.renders.mock.calls.length,
      secondRenders: calls.second.renders.mock.calls.length,
      secondSelects: calls.second.selects.mock.calls.length,
    });
    const before = count();

    act(() => {
      first.plugin(OpenPlugin).viewStore.set({ open: true });
    });
    const after = count();

    expect({
      firstRenders: after.firstRenders - before.firstRenders,
      secondRenders: after.secondRenders - before.secondRenders,
      secondSelects: after.secondSelects - before.secondSelects,
      shown: [
        calls.first.shown.mock.calls.at(-1)?.[0],
        calls.second.shown.mock.calls.at(-1)?.[0],
      ],
    }).toEqual({
      firstRenders: 1,
      secondRenders: 0,
      secondSelects: 0,
      shown: [true, false],
    });
  });
});
