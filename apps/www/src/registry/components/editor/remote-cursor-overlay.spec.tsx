import { describe, expect, it } from 'bun:test';

import { act, render, waitFor } from '@testing-library/react';
import { BaseParagraphPlugin } from 'platejs';
import { createEditor, Plate, PlateContent } from 'platejs/react';
import React from 'react';

import { FakeProvider } from '../../../../../../packages/plitejs/test/yjs/support/provider';
import { YjsPlugin } from './remote-cursor-overlay';

describe('copied remote selection presentation', () => {
  it('tracks metadata, selection, and reconnects through the configured Yjs source', async () => {
    const provider = new FakeProvider({
      awarenessClientId: 101,
      status: 'connected',
      synced: true,
    });
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'alpha' }], type: 'paragraph' },
        { children: [{ text: 'beta' }], type: 'paragraph' },
      ],
      plugins: [
        BaseParagraphPlugin,
        YjsPlugin.configure({
          initialState: { clientId: 'local', provider },
        }),
      ],
      schema: { id: 'copied-yjs-presentation', version: 1 },
    });
    const view = render(
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );
    const remoteSelection = () =>
      view.container.querySelector(
        '[data-remote-selection][data-client-id="202"]'
      );

    try {
      act(() => {
        editor.update.selection.set({
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
        provider.awareness.setRemoteState(202, {
          data: { color: '#123456', name: 'Ada' },
          selection: provider.awareness.getLocalState()?.selection,
        });
      });
      await waitFor(() => {
        expect(remoteSelection()?.textContent).toBe('lp');
        expect(remoteSelection()?.getAttribute('style')).toContain('#12345633');
      });

      act(() => {
        provider.awareness.setRemoteState(202, {
          data: { color: '#654321', name: 'Ada' },
          selection: provider.awareness.getLocalState()?.selection,
        });
      });
      await waitFor(() => {
        expect(remoteSelection()?.getAttribute('style')).toContain('#65432133');
      });

      act(() => {
        editor.update.selection.set({
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 2, path: [1, 0] },
        });
        provider.awareness.setRemoteState(202, {
          data: { color: 'invalid', name: 'Ada' },
          selection: provider.awareness.getLocalState()?.selection,
        });
      });
      await waitFor(() => {
        expect(remoteSelection()?.textContent).toBe('be');
        expect(remoteSelection()?.getAttribute('style')).toContain('#DB277733');
        expect(
          view.container.querySelectorAll('[data-remote-selection]')
        ).toHaveLength(1);
      });

      act(() => editor.update.yjs.disconnect());
      await waitFor(() => expect(remoteSelection()).toBeNull());

      act(() => editor.update.yjs.connect());
      await waitFor(() => {
        expect(remoteSelection()?.textContent).toBe('be');
        expect(remoteSelection()?.getAttribute('style')).toContain('#DB277733');
      });

      act(() => {
        editor.update.selection.set({
          anchor: { offset: 2, path: [1, 0] },
          focus: { offset: 2, path: [1, 0] },
        });
        provider.awareness.setRemoteState(202, {
          selection: provider.awareness.getLocalState()?.selection,
        });
      });
      await waitFor(() => expect(remoteSelection()).toBeNull());
    } finally {
      view.unmount();
    }
  });
});
